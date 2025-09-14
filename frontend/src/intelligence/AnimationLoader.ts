import * as THREE from 'three';

export class AnimationLoader {
  private static instance: AnimationLoader;
  private cache: Map<string, THREE.AnimationClip> = new Map();
  private loading: Map<string, Promise<THREE.AnimationClip | null>> = new Map();
  
  static getInstance(): AnimationLoader {
    if (!AnimationLoader.instance) {
      AnimationLoader.instance = new AnimationLoader();
    }
    return AnimationLoader.instance;
  }
  
  /**
   * Load animation from FBX file with caching
   */
  async loadAnimation(animationName: string): Promise<THREE.AnimationClip | null> {
    // Check cache first
    if (this.cache.has(animationName)) {
      return this.cache.get(animationName)!;
    }
    
    // Check if already loading
    if (this.loading.has(animationName)) {
      return this.loading.get(animationName)!;
    }
    
    // Start loading
    const loadPromise = this.loadFromFile(animationName);
    this.loading.set(animationName, loadPromise);
    
    try {
      const clip = await loadPromise;
      if (clip) {
        this.cache.set(animationName, clip);
      }
      this.loading.delete(animationName);
      return clip;
    } catch (error) {
      this.loading.delete(animationName);
      throw error;
    }
  }
  
  /**
   * Load animation from FBX file using dynamic import
   */
  private async loadFromFile(animationName: string): Promise<THREE.AnimationClip | null> {
    try {
      // Dynamic import of FBXLoader to avoid bundling issues
      const { FBXLoader } = await import('three/examples/jsm/loaders/FBXLoader.js');
      
      return new Promise((resolve, reject) => {
        const loader = new FBXLoader();
        
        loader.load(
          `/animations/${animationName}.fbx`,
          (fbx) => {
            if (fbx.animations && fbx.animations.length > 0) {
              const clip = fbx.animations[0];
              clip.name = animationName;
              
              // Optimize animation clip - CRITICAL FIX for camera issue
              this.optimizeClip(clip);
              
              console.log(`Successfully loaded animation: ${animationName}`);
              resolve(clip);
            } else {
              console.warn(`No animations found in ${animationName}.fbx`);
              resolve(null);
            }
          },
          (progress) => {
            // Optional: Track loading progress
            const percent = progress.total > 0 ? (progress.loaded / progress.total * 100) : 0;
            console.debug(`Loading ${animationName}: ${percent.toFixed(1)}%`);
          },
          (error) => {
            console.error(`Failed to load animation: ${animationName}`, error);
            reject(error);
          }
        );
      });
    } catch (error) {
      console.error(`Failed to import FBXLoader for ${animationName}:`, error);
      return null;
    }
  }
  
  /**
   * Optimize animation clip for better performance and filter unwanted tracks
   * CRITICAL FIX: This prevents camera movement issues
   */
  private optimizeClip(clip: THREE.AnimationClip): void {
    console.log(`🔍 Optimizing clip "${clip.name}" - Original tracks: ${clip.tracks.length}`);
    
    // DEBUG: Log all track names to identify problematic ones
    console.log(`📋 All tracks in ${clip.name}:`);
    clip.tracks.forEach((track, index) => {
      console.log(`  ${index}: ${track.name} (${track.values.length} keyframes)`);
    });
    
    // Filter out unwanted tracks that cause rotation issues
    clip.tracks = clip.tracks.filter(track => {
      // Remove tracks that affect cameras, scenes, or lights
      if (track.name.includes('Camera') || 
          track.name.includes('Scene') || 
          track.name.includes('Light') ||
          track.name.includes('Object3D') ||
          track.name.includes('Default') ||
          track.name.includes('RootNode') ||
          track.name.includes('Root') ||
          track.name.toLowerCase().includes('camera')) {
        return false;
      }
      
      // CRITICAL: More precise filtering for armature/root transforms
      const trackObject = track.name.split('.')[0];
      const trackProperty = track.name.split('.').pop();
      
      // Filter out armature container transforms that cause 90-degree rotation
      // Only filter if it's the main armature container, not bone animations
      if (trackObject === 'Armature') {
        // Keep bone animations (they have specific bone names after Armature)
        const parts = track.name.split('.');
        if (parts.length > 2) {
          // This is a bone animation, keep it
          return true;
        }
        
        // This is armature container transform - analyze if it causes rotation
        if (trackProperty === 'quaternion') {
          // Check if this quaternion track has significant rotation
          const hasSignificantRotation = this.hasSignificantRotation(track);
          if (hasSignificantRotation) {
            console.log(`⚠️ Filtering out armature quaternion with significant rotation: ${track.name}`);
            return false;
          } else {
            console.log(`✅ Keeping armature quaternion (minimal rotation): ${track.name}`);
            return true;
          }
        }
        
        // Filter out other armature container transforms
        if (trackProperty === 'position' || 
            trackProperty === 'rotation' || 
            trackProperty === 'scale') {
          console.log(`⚠️ Filtering out armature container transform: ${track.name}`);
          return false;
        }
      }
      
      // Filter out scene/root node transforms
      if ((trackObject === 'Scene' || 
           trackObject === 'RootNode' || 
           trackObject === 'Root' ||
           trackObject === '') && 
          (trackProperty === 'position' || 
           trackProperty === 'rotation' || 
           trackProperty === 'quaternion' ||
           trackProperty === 'scale')) {
        console.log(`⚠️ Filtering out scene/root transform track: ${track.name}`);
        return false;
      }
      
      // Keep tracks that have meaningful changes
      if (track.values.length === 0) return false;
      
      // Check if track has actual animation (not just static values)
      const firstValue = track.values[0];
      const hasVariation = track.values.some(value => Math.abs(value - firstValue) > 0.001);
      
      if (!hasVariation) {
        console.log(`⚠️ Filtering out static track: ${track.name}`);
        return false;
      }
      
      return true;
    });
    
    console.log(`✅ Optimized clip "${clip.name}" - Remaining tracks: ${clip.tracks.length}`);
    
    // Log remaining track names for debugging
    if (clip.tracks.length < 20) {
      clip.tracks.forEach(track => {
        console.log(`  📍 Track: ${track.name}`);
      });
    }
    
    // Optimize track data
    clip.tracks.forEach(track => {
      track.optimize();
    });
    
    // Trim clip duration if needed
    clip.trim();
  }
  
  /**
   * Check if a quaternion track has significant rotation that could cause camera issues
   */
  private hasSignificantRotation(track: THREE.KeyframeTrack): boolean {
    if (track.values.length < 2) return false;
    
    // For quaternion tracks, check if there's significant rotation
    // Quaternion values are [x, y, z, w] for each keyframe
    const quaternionCount = track.values.length / 4;
    
    if (quaternionCount < 2) return false;
    
    // Get first and last quaternion
    const firstQuat = new THREE.Quaternion(
      track.values[0], track.values[1], track.values[2], track.values[3]
    );
    const lastQuat = new THREE.Quaternion(
      track.values[track.values.length - 4], 
      track.values[track.values.length - 3], 
      track.values[track.values.length - 2], 
      track.values[track.values.length - 1]
    );
    
    // Calculate the rotation difference
    const rotationDiff = firstQuat.clone().invert().multiply(lastQuat);
    const angle = 2 * Math.acos(Math.abs(rotationDiff.w));
    
    // If rotation is more than 5 degrees, consider it significant
    const significantRotation = angle > (5 * Math.PI / 180);
    
    console.log(`🔍 Quaternion rotation analysis for ${track.name}: ${(angle * 180 / Math.PI).toFixed(2)}° (significant: ${significantRotation})`);
    
    return significantRotation;
  }
  
  /**
   * Preload multiple animations
   */
  async preloadAnimations(animationNames: string[]): Promise<void> {
    const loadPromises = animationNames.map(name => 
      this.loadAnimation(name).catch(error => {
        console.warn(`Failed to preload animation: ${name}`, error);
        return null;
      })
    );
    
    await Promise.all(loadPromises);
    console.log(`Preloaded ${animationNames.length} animations`);
  }
  
  /**
   * Get cached animation
   */
  getCachedAnimation(animationName: string): THREE.AnimationClip | null {
    return this.cache.get(animationName) || null;
  }
  
  /**
   * Check if animation is cached
   */
  isCached(animationName: string): boolean {
    return this.cache.has(animationName);
  }
  
  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    this.loading.clear();
  }
  
  /**
   * Get cache statistics
   */
  getCacheStats(): { cached: number; loading: number; memoryUsage: string } {
    const memoryUsage = this.cache.size * 50; // Rough estimate in KB
    return {
      cached: this.cache.size,
      loading: this.loading.size,
      memoryUsage: `~${memoryUsage}KB`
    };
  }
}
