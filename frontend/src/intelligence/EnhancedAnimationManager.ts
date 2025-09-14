/**
 * Enhanced Animation Manager với Sequence Support
 * Extends existing animation management với multi-animation sequences và timeline sync
 */

import * as THREE from 'three';
import { AnimationLoader } from './AnimationLoader';
import { AnimationAction, SequenceStep } from '@/types/avatar';


export interface AnimationManagerCallbacks {
  onAnimationStart?: (animation: string) => void;
  onAnimationEnd?: (animation: string) => void;
  onSequenceComplete?: () => void;
  onError?: (error: string) => void;
}

export class EnhancedAnimationManager {
  private mixer: THREE.AnimationMixer;
  private group: THREE.Group;
  private animationLoader: AnimationLoader;
  
  // Current state
  private currentActions: Map<string, AnimationAction> = new Map();
  private isPlaying: boolean = false;
  private sequenceStartTime: number = 0;
  private currentSequence: SequenceStep[] = [];
  private sequenceIndex: number = 0;
  
  // Timeline sync
  private audioElement: HTMLAudioElement | null = null;
  private syncMode: 'none' | 'audio' | 'timeline' = 'none';
  
  // Callbacks
  private callbacks: AnimationManagerCallbacks;
  
  // Performance monitoring
  private stats = {
    totalActions: 0,
    activeActions: 0,
    lastFrameTime: 0,
    avgFrameTime: 0
  };

  constructor(group: THREE.Group, callbacks: AnimationManagerCallbacks = {}) {
    this.group = group;
    this.callbacks = callbacks;
    
    // Find the actual avatar object instead of using the entire group
    const avatarObject = this.findAvatarObject(group);
    this.mixer = new THREE.AnimationMixer(avatarObject || group);
    this.animationLoader = AnimationLoader.getInstance();
    
    console.log('🎬 EnhancedAnimationManager initialized');
    console.log('🎯 Animation target:', avatarObject ? avatarObject.constructor.name : 'Group (fallback)');
  }

  /**
   * Find the actual avatar object that should receive animations
   */
  private findAvatarObject(group: THREE.Group): THREE.Object3D | null {
    // Look for the model object (usually a Group or Mesh with many children)
    let targetObject: THREE.Object3D | null = null;
    
    group.traverse((child) => {
      // Skip if it's a camera
      if (child.type.includes('Camera')) return;
      
      // Look for object with skeleton or many morph targets (likely the avatar)
      if (child.type === 'SkinnedMesh' || child.type === 'Mesh') {
        const mesh = child as THREE.Mesh;
        if (mesh.morphTargetInfluences && mesh.morphTargetInfluences.length > 10) {
          targetObject = child;
          console.log('🎯 Found avatar mesh with morph targets:', child.name);
          return;
        }
      }
      
      // Look for object with skeleton
      if ('skeleton' in child) {
        targetObject = child;
        console.log('🎯 Found avatar object with skeleton:', child.name);
        return;
      }
      
      // Look for armature or bone structure
      if (child.name.toLowerCase().includes('armature') || 
          child.name.toLowerCase().includes('skeleton') ||
          child.type === 'Bone') {
        targetObject = child.parent || child;
        console.log('🎯 Found armature/skeleton parent:', targetObject?.name);
        return;
      }
    });
    
    return targetObject;
  }

  /**
   * Play single animation (existing functionality)
   */
  async playAnimation(animationName: string, crossfadeDuration: number = 0.3): Promise<void> {
    try {
      console.log(`🎬 Playing single animation: ${animationName}`);
      
      // Stop current sequence if any
      this.stopSequence();
      
      // Load animation
      const clip = await this.animationLoader.loadAnimation(animationName);
      if (!clip) {
        throw new Error(`Animation not found: ${animationName}`);
      }
      
      // Stop previous animations with crossfade
      await this.crossfadeToAnimation(animationName, clip, crossfadeDuration);
      
      this.callbacks.onAnimationStart?.(animationName);
      
    } catch (error: any) {
      console.error(`❌ Failed to play animation ${animationName}:`, error);
      this.callbacks.onError?.(`Failed to play animation: ${error.message}`);
      throw error;
    }
  }

  /**
   * Play animation sequence với timeline synchronization
   */
  async playSequence(sequence: SequenceStep[], audioElement?: HTMLAudioElement): Promise<void> {
    try {
      console.log(`🎬 Playing animation sequence:`, sequence.map(s => s.animation));
      
      // Stop current animations
      this.stopAll();
      
      // Setup sequence
      this.currentSequence = sequence;
      this.sequenceIndex = 0;
      this.sequenceStartTime = performance.now() / 1000;
      this.audioElement = audioElement || null;
      this.syncMode = audioElement ? 'audio' : 'timeline';
      
      // Preload all animations in sequence
      await this.preloadSequenceAnimations(sequence);
      
      // Start first animation
      await this.startSequenceStep(0);
      
      this.isPlaying = true;
      
    } catch (error: any) {
      console.error(`❌ Failed to play sequence:`, error);
      this.callbacks.onError?.(`Failed to play sequence: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update animation mixer và sequence management
   */
  update(deltaTime: number): void {
    const frameStart = performance.now();
    
    if (!this.mixer) return;
    
    // Update mixer
    this.mixer.update(deltaTime);
    
    // Update sequence if playing
    if (this.isPlaying && this.currentSequence.length > 0) {
      this.updateSequence();
    }
    
    // Update performance stats
    this.updateStats(frameStart);
  }

  /**
   * Update sequence progression
   */
  private updateSequence(): void {
    if (this.sequenceIndex >= this.currentSequence.length) {
      this.completeSequence();
      return;
    }

    const currentTime = this.getCurrentTime();
    const currentStep = this.currentSequence[this.sequenceIndex];
    const stepEndTime = currentStep.startTime + currentStep.duration;
    
    // Check if current step should end
    if (currentTime >= stepEndTime) {
      // Start next step if available
      const nextIndex = this.sequenceIndex + 1;
      if (nextIndex < this.currentSequence.length) {
        this.startSequenceStep(nextIndex);
      } else {
        this.completeSequence();
      }
    }
    
    // Update audio sync if available
    if (this.syncMode === 'audio' && this.audioElement) {
      this.syncWithAudio(currentStep);
    }
  }

  /**
   * Start specific sequence step
   */
  private async startSequenceStep(stepIndex: number): Promise<void> {
    if (stepIndex >= this.currentSequence.length) return;
    
    const step = this.currentSequence[stepIndex];
    const nextStep = this.currentSequence[stepIndex + 1];
    
    console.log(`🎬 Starting sequence step ${stepIndex}: ${step.animation}`);
    
    try {
      // Load animation
      const clip = await this.animationLoader.loadAnimation(step.animation);
      if (!clip) {
        console.warn(`⚠️ Animation not found: ${step.animation}, skipping`);
        this.sequenceIndex = stepIndex + 1;
        return;
      }
      
      // Create action
      const action = this.mixer.clipAction(clip);
      action.reset();
      action.setLoop(THREE.LoopOnce, 1);
      action.clampWhenFinished = true;
      
      // Handle crossfade with previous animation
      if (stepIndex > 0) {
        const prevStep = this.currentSequence[stepIndex - 1];
        const crossfadeDuration = Math.min(step.crossfadeIn, prevStep.crossfadeOut);
        action.fadeIn(crossfadeDuration);
        
        // Fade out previous animations
        this.currentActions.forEach((animAction, animName) => {
          if (animName !== step.animation) {
            animAction.action.fadeOut(crossfadeDuration);
            setTimeout(() => {
              this.currentActions.delete(animName);
            }, crossfadeDuration * 1000);
          }
        });
      } else {
        action.fadeIn(step.crossfadeIn);
      }
      
      // Setup crossfade out for next animation
      if (nextStep) {
        const crossfadeOutTime = (step.duration - step.crossfadeOut) * 1000;
        setTimeout(() => {
          action.fadeOut(step.crossfadeOut);
        }, crossfadeOutTime);
      }
      
      // Play animation
      action.play();
      
      // Store action info
      const animAction: AnimationAction = {
        action,
        animation: step.animation,
        startTime: step.startTime,
        duration: step.duration,
        weight: step.weight || 1.0,
        crossfadeIn: step.crossfadeIn,
        crossfadeOut: step.crossfadeOut
      };
      
      this.currentActions.set(step.animation, animAction);
      this.sequenceIndex = stepIndex;
      
      this.callbacks.onAnimationStart?.(step.animation);
      
    } catch (error: any) {
      console.error(`❌ Failed to start sequence step ${stepIndex}:`, error);
      // Skip to next step
      this.sequenceIndex = stepIndex + 1;
    }
  }

  /**
   * Crossfade to new animation
   */
  private async crossfadeToAnimation(
    animationName: string, 
    clip: THREE.AnimationClip, 
    crossfadeDuration: number
  ): Promise<void> {
    // Stop and fade out current actions
    this.currentActions.forEach((animAction) => {
      animAction.action.fadeOut(crossfadeDuration);
    });
    
    // Create new action
    const action = this.mixer.clipAction(clip);
    action.reset();
    action.fadeIn(crossfadeDuration);
    action.play();
    
    // Store new action
    const animAction: AnimationAction = {
      action,
      animation: animationName,
      startTime: performance.now() / 1000,
      duration: clip.duration,
      weight: 1.0,
      crossfadeIn: crossfadeDuration,
      crossfadeOut: 0
    };
    
    // Clear old actions after crossfade
    setTimeout(() => {
      this.currentActions.clear();
      this.currentActions.set(animationName, animAction);
    }, crossfadeDuration * 1000);
  }

  /**
   * Sync animation with audio playback
   */
  private syncWithAudio(currentStep: SequenceStep): void {
    if (!this.audioElement) return;
    
    const audioTime = this.audioElement.currentTime;
    const action = this.currentActions.get(currentStep.animation)?.action;
    
    if (action) {
      // Calculate target animation time based on audio progress
      const stepProgress = (audioTime - currentStep.startTime) / currentStep.duration;
      const targetTime = Math.max(0, Math.min(stepProgress * action.getClip().duration, action.getClip().duration));
      
      // Smooth sync to avoid jerkiness
      const currentTime = action.time;
      const timeDiff = Math.abs(targetTime - currentTime);
      
      if (timeDiff > 0.1) { // Only sync if significant difference
        action.time = THREE.MathUtils.lerp(currentTime, targetTime, 0.1);
      }
    }
  }

  /**
   * Get current time based on sync mode
   */
  private getCurrentTime(): number {
    switch (this.syncMode) {
      case 'audio':
        return this.audioElement?.currentTime || 0;
      case 'timeline':
      default:
        return (performance.now() / 1000) - this.sequenceStartTime;
    }
  }

  /**
   * Preload all animations in sequence
   */
  private async preloadSequenceAnimations(sequence: SequenceStep[]): Promise<void> {
    const animationNames = sequence.map(step => step.animation);
    const uniqueNames = [...new Set(animationNames)];
    
    console.log(`🎬 Preloading ${uniqueNames.length} animations for sequence`);
    
    await this.animationLoader.preloadAnimations(uniqueNames);
  }

  /**
   * Complete sequence
   */
  private completeSequence(): void {
    console.log('✅ Animation sequence completed');
    
    this.isPlaying = false;
    this.currentSequence = [];
    this.sequenceIndex = 0;
    this.syncMode = 'none';
    this.audioElement = null;
    
    this.callbacks.onSequenceComplete?.();
  }

  /**
   * Stop current sequence
   */
  stopSequence(): void {
    if (this.isPlaying) {
      console.log('⏹️ Stopping animation sequence');
      this.completeSequence();
    }
  }

  /**
   * Stop all animations
   */
  stopAll(): void {
    console.log('⏹️ Stopping all animations');
    
    this.mixer.stopAllAction();
    this.currentActions.clear();
    this.stopSequence();
  }

  /**
   * Update performance stats
   */
  private updateStats(frameStart: number): void {
    const frameTime = performance.now() - frameStart;
    this.stats.lastFrameTime = frameTime;
    this.stats.avgFrameTime = (this.stats.avgFrameTime * 0.9) + (frameTime * 0.1);
    this.stats.activeActions = this.currentActions.size;
  }

  /**
   * Get performance statistics
   */
  getStats(): typeof this.stats {
    return { ...this.stats };
  }

  /**
   * Get current state
   */
  getCurrentState(): any {
    return {
      isPlaying: this.isPlaying,
      activeAnimations: Array.from(this.currentActions.keys()),
      sequenceProgress: this.currentSequence.length > 0 ? 
        `${this.sequenceIndex}/${this.currentSequence.length}` : 'none',
      syncMode: this.syncMode,
      hasAudio: !!this.audioElement
    };
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    console.log('💥 Destroying EnhancedAnimationManager');
    
    this.stopAll();
    this.mixer.uncacheRoot(this.group);
    this.currentActions.clear();
    this.audioElement = null;
  }
}

export default EnhancedAnimationManager;
