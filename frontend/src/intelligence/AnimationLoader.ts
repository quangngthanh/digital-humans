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
              
              // Optimize animation clip
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
   * Optimize animation clip for better performance
   */
  private optimizeClip(clip: THREE.AnimationClip): void {
    // Remove unused tracks
    clip.tracks = clip.tracks.filter(track => {
      // Keep tracks that have meaningful changes
      if (track.values.length === 0) return false;
      
      // Check if track has actual animation (not just static values)
      const firstValue = track.values[0];
      const hasVariation = track.values.some(value => Math.abs(value - firstValue) > 0.001);
      
      return hasVariation;
    });
    
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