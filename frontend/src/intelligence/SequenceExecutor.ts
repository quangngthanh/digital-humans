/**
 * SequenceExecutor - Precise timeline execution of animation sequences
 * Handles real-time sequence execution với audio synchronization
 */

import type { AnimationSequence, AnimationStep } from './SequencePlanner';

export interface SequenceExecutorCallbacks {
  onAnimationChange?: (animation: string) => void;
  onStepStart?: (step: AnimationStep, index: number) => void;
  onStepEnd?: (step: AnimationStep, index: number) => void;
  onSequenceComplete?: () => void;
  onError?: (error: string) => void;
}

export interface ExecutionState {
  isRunning: boolean;
  currentStepIndex: number;
  currentTime: number;
  startTime: number;
  sequence: AnimationSequence | null;
  audioElement: HTMLAudioElement | null;
}

export class SequenceExecutor {
  private callbacks: SequenceExecutorCallbacks;
  private state: ExecutionState = {
    isRunning: false,
    currentStepIndex: -1,
    currentTime: 0,
    startTime: 0,
    sequence: null,
    audioElement: null
  };

  // Timeline management
  private animationFrameId: number = 0;
  private stepTimeouts: NodeJS.Timeout[] = [];
  private syncInterval: NodeJS.Timeout | null = null;

  // Performance monitoring
  private lastFrameTime: number = 0;
  private frameCount: number = 0;

  constructor(callbacks: SequenceExecutorCallbacks = {}) {
    this.callbacks = callbacks;
    console.log('⚡ SequenceExecutor initialized');
  }

  /**
   * Execute animation sequence
   */
  async executeSequence(sequence: AnimationSequence, audioElement?: HTMLAudioElement): Promise<void> {
    try {
      console.log('⚡ Starting sequence execution:', {
        steps: sequence.animations.length,
        totalDuration: sequence.totalDuration,
        hasAudio: !!audioElement
      });

      // Stop any current execution
      this.stop();

      // Setup execution state
      this.state = {
        isRunning: true,
        currentStepIndex: -1,
        currentTime: 0,
        startTime: performance.now() / 1000,
        sequence,
        audioElement: audioElement || null
      };

      // Schedule all animation steps
      this.scheduleAnimationSteps();

      // Start timeline monitoring
      this.startTimelineMonitoring();

      // Setup audio sync if available
      if (audioElement) {
        this.setupAudioSync(audioElement);
      }

    } catch (error: any) {
      console.error('❌ Failed to execute sequence:', error);
      this.callbacks.onError?.(`Sequence execution failed: ${error.message}`);
      this.stop();
    }
  }

  /**
   * Schedule all animation steps
   */
  private scheduleAnimationSteps(): void {
    if (!this.state.sequence) return;

    this.state.sequence.animations.forEach((step, index) => {
      // Schedule step start
      const startTimeout = setTimeout(() => {
        this.startAnimationStep(step, index);
      }, step.startTime * 1000);

      this.stepTimeouts.push(startTimeout);

      // Schedule step end
      const endTime = step.startTime + step.duration;
      const endTimeout = setTimeout(() => {
        this.endAnimationStep(step, index);
      }, endTime * 1000);

      this.stepTimeouts.push(endTimeout);
    });

    // Schedule sequence completion
    const completeTimeout = setTimeout(() => {
      this.completeSequence();
    }, this.state.sequence.totalDuration * 1000);

    this.stepTimeouts.push(completeTimeout);
  }

  /**
   * Start animation step
   */
  private startAnimationStep(step: AnimationStep, index: number): void {
    if (!this.state.isRunning) return;

    console.log(`⚡ Starting step ${index}: ${step.animation} at ${step.startTime.toFixed(2)}s`);

    this.state.currentStepIndex = index;
    
    // Notify callbacks
    this.callbacks.onStepStart?.(step, index);
    this.callbacks.onAnimationChange?.(step.animation);
  }

  /**
   * End animation step
   */
  private endAnimationStep(step: AnimationStep, index: number): void {
    if (!this.state.isRunning) return;

    console.log(`⚡ Ending step ${index}: ${step.animation}`);
    
    this.callbacks.onStepEnd?.(step, index);
  }

  /**
   * Complete sequence
   */
  private completeSequence(): void {
    if (!this.state.isRunning) return;

    console.log('✅ Sequence execution completed');

    this.stop();
    this.callbacks.onSequenceComplete?.();
  }

  /**
   * Start timeline monitoring
   */
  private startTimelineMonitoring(): void {
    const monitor = () => {
      if (!this.state.isRunning) return;

      this.updateCurrentTime();
      this.frameCount++;

      // Continue monitoring
      this.animationFrameId = requestAnimationFrame(monitor);
    };

    this.animationFrameId = requestAnimationFrame(monitor);
  }

  /**
   * Update current time
   */
  private updateCurrentTime(): void {
    const now = performance.now() / 1000;
    this.state.currentTime = now - this.state.startTime;
  }

  /**
   * Setup audio synchronization
   */
  private setupAudioSync(audioElement: HTMLAudioElement): void {
    console.log('🎵 Setting up audio synchronization');

    // Monitor audio sync every 100ms
    this.syncInterval = setInterval(() => {
      this.checkAudioSync(audioElement);
    }, 100);

    // Handle audio events
    audioElement.addEventListener('ended', () => {
      console.log('🎵 Audio ended, completing sequence');
      this.completeSequence();
    });

    audioElement.addEventListener('error', (error) => {
      console.error('❌ Audio error:', error);
      this.callbacks.onError?.('Audio playback error');
    });

    audioElement.addEventListener('pause', () => {
      console.log('⏸️ Audio paused');
      // Could pause sequence here if needed
    });

    audioElement.addEventListener('play', () => {
      console.log('▶️ Audio resumed');
      // Could resume sequence here if needed
    });
  }

  /**
   * Check audio synchronization
   */
  private checkAudioSync(audioElement: HTMLAudioElement): void {
    if (!this.state.isRunning || !this.state.sequence) return;

    const audioTime = audioElement.currentTime;
    const sequenceTime = this.state.currentTime;
    const timeDiff = Math.abs(audioTime - sequenceTime);

    // Log significant sync issues
    if (timeDiff > 0.5) {
      console.warn(`⚠️ Audio sync drift: ${timeDiff.toFixed(2)}s (audio: ${audioTime.toFixed(2)}s, sequence: ${sequenceTime.toFixed(2)}s)`);
    }

    // Auto-correct major sync issues
    if (timeDiff > 1.0) {
      console.log('🔧 Auto-correcting major sync drift');
      this.correctSyncDrift(audioTime);
    }
  }

  /**
   * Correct sync drift
   */
  private correctSyncDrift(audioTime: number): void {
    // Adjust start time to realign with audio
    const now = performance.now() / 1000;
    this.state.startTime = now - audioTime;
    this.state.currentTime = audioTime;

    console.log(`🔧 Sync corrected to audio time: ${audioTime.toFixed(2)}s`);
  }

  /**
   * Stop sequence execution
   */
  stop(): void {
    if (!this.state.isRunning) return;

    console.log('⏹️ Stopping sequence execution');

    // Stop timeline monitoring
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = 0;
    }

    // Clear all timeouts
    this.stepTimeouts.forEach(timeout => clearTimeout(timeout));
    this.stepTimeouts = [];

    // Clear sync interval
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    // Reset state
    this.state.isRunning = false;
    this.state.currentStepIndex = -1;
    this.state.currentTime = 0;
    this.state.sequence = null;
    this.state.audioElement = null;
  }

  /**
   * Get current execution state
   */
  getCurrentState(): ExecutionState {
    return { ...this.state };
  }

  /**
   * Get current step
   */
  getCurrentStep(): AnimationStep | null {
    if (!this.state.sequence || this.state.currentStepIndex < 0) {
      return null;
    }
    return this.state.sequence.animations[this.state.currentStepIndex] || null;
  }

  /**
   * Get execution progress (0-1)
   */
  getProgress(): number {
    if (!this.state.sequence || !this.state.isRunning) {
      return 0;
    }
    return Math.min(this.state.currentTime / this.state.sequence.totalDuration, 1);
  }

  /**
   * Get performance stats
   */
  getPerformanceStats(): any {
    return {
      frameCount: this.frameCount,
      isRunning: this.state.isRunning,
      currentTime: this.state.currentTime,
      activeTimeouts: this.stepTimeouts.length,
      hasAudioSync: !!this.state.audioElement
    };
  }

  /**
   * Check if currently executing
   */
  isExecuting(): boolean {
    return this.state.isRunning;
  }

  /**
   * Force complete sequence
   */
  forceComplete(): void {
    console.log('🔧 Force completing sequence');
    this.completeSequence();
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    console.log('💥 Destroying SequenceExecutor');
    this.stop();
    this.frameCount = 0;
  }
}

export default SequenceExecutor;
