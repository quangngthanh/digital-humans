import { IDLE_ANIMATION_RULES } from '@/constants/animation-registry';

export interface IdleAnimationCallbacks {
  onIdleAnimation?: (animation: string) => void;
  onIdleStateChange?: (isIdle: boolean) => void;
}

export interface IdleState {
  isActive: boolean;
  currentEmotion: string;
  lastAnimation: string | null;
  nextAnimationTime: number;
  animationHistory: string[];
}

export class IdleAnimationManager {
  private callbacks: IdleAnimationCallbacks;
  private state: IdleState = {
    isActive: false,
    currentEmotion: 'default',
    lastAnimation: null,
    nextAnimationTime: 0,
    animationHistory: []
  };

  // Timers and intervals
  private idleTimer: NodeJS.Timeout | null = null;
  private animationFrameId: number = 0;

  // Configuration
  private config = {
    minInterval: IDLE_ANIMATION_RULES.intervals.min * 1000,
    maxInterval: IDLE_ANIMATION_RULES.intervals.max * 1000,
    historySize: IDLE_ANIMATION_RULES.repetitionPrevention.historySize,
    maxConsecutive: IDLE_ANIMATION_RULES.repetitionPrevention.maxConsecutive
  };

  constructor(callbacks: IdleAnimationCallbacks = {}) {
    this.callbacks = callbacks;
    console.log('😴 IdleAnimationManager initialized');
  }

  /**
   * Start idle animation system
   */
  start(emotion: string = 'default'): void {
    console.log(`😴 Starting idle animations with emotion: ${emotion}`);

    this.state.isActive = true;
    this.state.currentEmotion = emotion;
    this.state.nextAnimationTime = Date.now() + this.getRandomInterval();

    this.callbacks.onIdleStateChange?.(true);

    // Start monitoring loop
    this.startMonitoring();

    // Schedule first idle animation
    this.scheduleNextAnimation();
  }

  /**
   * Stop idle animation system
   */
  stop(): void {
    if (!this.state.isActive) return;

    console.log('😴 Stopping idle animations');

    this.state.isActive = false;
    this.callbacks.onIdleStateChange?.(false);

    // Clear timers
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = 0;
    }
  }

  /**
   * Update current emotion context
   */
  updateEmotion(emotion: string): void {
    if (this.state.currentEmotion !== emotion) {
      console.log(`😴 Updating idle emotion: ${this.state.currentEmotion} → ${emotion}`);
      this.state.currentEmotion = emotion;
      
      // Reschedule next animation with new emotion context
      if (this.state.isActive) {
        this.scheduleNextAnimation();
      }
    }
  }

  /**
   * Force trigger idle animation
   */
  triggerIdleAnimation(): void {
    if (!this.state.isActive) {
      console.warn('⚠️ Cannot trigger idle animation - system not active');
      return;
    }

    const animation = this.selectIdleAnimation();
    this.playIdleAnimation(animation);
  }

  /**
   * Start monitoring loop
   */
  private startMonitoring(): void {
    const monitor = () => {
      if (!this.state.isActive) return;

      // Check if it's time for next animation
      const now = Date.now();
      if (now >= this.state.nextAnimationTime) {
        this.triggerIdleAnimation();
        this.scheduleNextAnimation();
      }

      // Continue monitoring
      this.animationFrameId = requestAnimationFrame(monitor);
    };

    this.animationFrameId = requestAnimationFrame(monitor);
  }

  /**
   * Schedule next idle animation
   */
  private scheduleNextAnimation(): void {
    const interval = this.getRandomInterval();
    this.state.nextAnimationTime = Date.now() + interval;

    console.log(`😴 Next idle animation scheduled in ${(interval / 1000).toFixed(1)}s`);

    // Clear existing timer
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
    }

    // Set new timer as backup
    this.idleTimer = setTimeout(() => {
      if (this.state.isActive) {
        this.triggerIdleAnimation();
        this.scheduleNextAnimation();
      }
    }, interval);
  }

  /**
   * Get random interval based on emotion
   */
  private getRandomInterval(): number {
    const emotion = this.state.currentEmotion;
    
    // Emotion-specific intervals
    const emotionIntervals: Record<string, { min: number; max: number }> = {
      playful: { min: 3, max: 6 },
      excited: { min: 2, max: 5 },
      thoughtful: { min: 5, max: 10 },
      serious: { min: 6, max: 12 },
      romantic: { min: 4, max: 8 },
      default: { min: this.config.minInterval / 1000, max: this.config.maxInterval / 1000 }
    };

    const intervals = emotionIntervals[emotion] || emotionIntervals.default;
    const randomSeconds = intervals.min + Math.random() * (intervals.max - intervals.min);
    
    return randomSeconds * 1000;
  }

  /**
   * Select appropriate idle animation
   */
  private selectIdleAnimation(): string {
    const emotion = this.state.currentEmotion;
    const availableAnimations = this.getIdleAnimationsForEmotion(emotion);
    
    // Filter out recently used animations
    const filteredAnimations = this.filterRecentAnimations(availableAnimations);
    
    // If all animations are filtered out, use available pool
    const finalPool = filteredAnimations.length > 0 ? filteredAnimations : availableAnimations;
    
    // Random selection from final pool
    const selectedAnimation = finalPool[Math.floor(Math.random() * finalPool.length)];
    
    console.log(`😴 Selected idle animation: ${selectedAnimation} for emotion: ${emotion}`);
    
    return selectedAnimation;
  }

  /**
   * Get idle animations for specific emotion
   */
  private getIdleAnimationsForEmotion(emotion: string): string[] {
    const emotionMappings = IDLE_ANIMATION_RULES.emotionToIdle;
    return emotionMappings[emotion as keyof typeof emotionMappings] || emotionMappings.default;
  }

  /**
   * Filter out recently used animations to prevent repetition
   */
  private filterRecentAnimations(animations: string[]): string[] {
    // If we don't have enough variety, return all
    if (animations.length <= this.config.maxConsecutive) {
      return animations;
    }

    // Filter out animations in recent history
    const recentAnimations = this.state.animationHistory.slice(-this.config.maxConsecutive);
    const filtered = animations.filter(anim => !recentAnimations.includes(anim));
    
    return filtered;
  }

  /**
   * Play idle animation
   */
  private playIdleAnimation(animation: string): void {
    console.log(`😴 Playing idle animation: ${animation}`);

    // Update state
    this.state.lastAnimation = animation;
    
    // Add to history
    this.state.animationHistory.push(animation);
    
    // Trim history to prevent memory growth
    if (this.state.animationHistory.length > this.config.historySize) {
      this.state.animationHistory = this.state.animationHistory.slice(-this.config.historySize);
    }

    // Notify callback
    this.callbacks.onIdleAnimation?.(animation);
  }

  /**
   * Set idle expression for different emotional states
   */
  setIdleExpression(): void {
    const emotion = this.state.currentEmotion;
    
    // Map emotions to appropriate idle expressions
    const idleExpressions: Record<string, string> = {
      happy: 'smile',
      thoughtful: 'serious',
      romantic: 'loving',
      playful: 'mischievous',
      serious: 'serious',
      default: 'default'
    };

    const expression = idleExpressions[emotion as keyof typeof idleExpressions] || 'default';
    
    // This could trigger expression change if we had access to expression manager
    console.log(`😴 Idle expression for ${emotion}: ${expression}`);
  }

  /**
   * Get current idle state
   */
  getState(): IdleState {
    return { ...this.state };
  }

  /**
   * Get statistics
   */
  getStats(): any {
    const now = Date.now();
    const timeToNext = Math.max(0, this.state.nextAnimationTime - now);
    
    return {
      isActive: this.state.isActive,
      currentEmotion: this.state.currentEmotion,
      lastAnimation: this.state.lastAnimation,
      timeToNextAnimation: timeToNext / 1000,
      historySize: this.state.animationHistory.length,
      recentAnimations: this.state.animationHistory.slice(-3)
    };
  }

  /**
   * Check if specific animation can be played (not in recent history)
   */
  canPlayAnimation(animation: string): boolean {
    const recentAnimations = this.state.animationHistory.slice(-this.config.maxConsecutive);
    return !recentAnimations.includes(animation);
  }

  /**
   * Manually add animation to history (when external animations are played)
   */
  recordAnimation(animation: string): void {
    this.state.animationHistory.push(animation);
    if (this.state.animationHistory.length > this.config.historySize) {
      this.state.animationHistory = this.state.animationHistory.slice(-this.config.historySize);
    }
  }

  /**
   * Reset animation history
   */
  resetHistory(): void {
    console.log('😴 Resetting idle animation history');
    this.state.animationHistory = [];
    this.state.lastAnimation = null;
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<typeof this.config>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('😴 Updated idle configuration:', this.config);
  }

  /**
   * Check if currently in idle mode
   */
  isIdle(): boolean {
    return this.state.isActive;
  }

  /**
   * Get available idle animations for current emotion
   */
  getAvailableAnimations(): string[] {
    return this.getIdleAnimationsForEmotion(this.state.currentEmotion);
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    console.log('💥 Destroying IdleAnimationManager');
    this.stop();
    this.state.animationHistory = [];
  }
}

export default IdleAnimationManager;
