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
    
    // Filter out unwanted tracks that cause camera issues
    clip.tracks = clip.tracks.filter(track => {
      // Remove tracks that affect cameras, scenes, or lights
      if (track.name.includes('Camera') || 
          track.name.includes('Scene') || 
          track.name.includes('Light') ||
          track.name.includes('Object3D') ||
          track.name.includes('Default') ||
          track.name.includes('RootNode') ||
          track.name.includes('Root') ||
          track.name.includes('Armature.position') ||
          track.name.includes('Armature.rotation') ||
          track.name.includes('Armature.quaternion') ||
          track.name.includes('Armature.scale') ||
          track.name.toLowerCase().includes('camera')) {
        console.log(`⚠️ Filtering out unwanted track: ${track.name}`);
        return false;
      }
      
      // Only remove CONTAINER/ARMATURE transforms that affect camera/world position
      // DO NOT remove bone animations - they are needed for avatar movement
      const trackObject = track.name.split('.')[0];
      
      // Only filter out armature container transforms (not bone animations)
      if (trackObject === 'Armature' && 
          (track.name.includes('.position') || 
           track.name.includes('.rotation') || 
           track.name.includes('.quaternion') ||
           track.name.includes('.scale'))) {
        console.log(`⚠️ Filtering out armature transform track: ${track.name}`);
        return false;
      }
      
      // Filter out scene/root node transforms
      if ((trackObject === 'Scene' || 
           trackObject === 'RootNode' || 
           trackObject === 'Root' ||
           trackObject === '') && 
          (track.name.includes('.position') || 
           track.name.includes('.rotation') || 
           track.name.includes('.quaternion') ||
           track.name.includes('.scale'))) {
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
    
    // Log remaining track names for debugging (only for reasonable numbers)
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
