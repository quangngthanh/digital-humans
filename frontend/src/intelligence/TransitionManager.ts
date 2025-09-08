import { facialExpressions } from '@/constants';
import type { EmotionalIntent } from '@/types';

export interface TransitionState {
  currentExpression: string;
  targetExpression: string;
  progress: number;
  duration: number;
  startTime: number;
}

export interface BlendedExpression {
  [key: string]: number;
}

export class TransitionManager {
  private transitionQueue: Array<{
    expression: string;
    duration: number;
    priority: number;
  }> = [];
  
  private currentTransition: TransitionState | null = null;
  private isTransitioning: boolean = false;
  
  // Callback function to apply morph targets
  private applyMorphTargets: (expression: BlendedExpression) => void;

  constructor(applyMorphTargetsCallback: (expression: BlendedExpression) => void) {
    this.applyMorphTargets = applyMorphTargetsCallback;
  }

  /**
   * Start a smooth transition to a new expression
   */
  async transitionTo(
    targetExpression: string, 
    duration: number = 1000,
    priority: number = 1
  ): Promise<void> {
    // Add to queue with priority
    this.transitionQueue.push({
      expression: targetExpression,
      duration,
      priority
    });

    // Sort queue by priority (higher priority first)
    this.transitionQueue.sort((a, b) => b.priority - a.priority);

    if (!this.isTransitioning) {
      await this.processTransitionQueue();
    }
  }

  /**
   * Process all transitions in the queue
   */
  private async processTransitionQueue(): Promise<void> {
    this.isTransitioning = true;

    while (this.transitionQueue.length > 0) {
      const transition = this.transitionQueue.shift()!;
      await this.executeTransition(transition.expression, transition.duration);
    }

    this.isTransitioning = false;
  }

  /**
   * Execute a single transition
   */
  private async executeTransition(targetExpression: string, duration: number): Promise<void> {
    return new Promise((resolve) => {
      const startExpression = this.getCurrentExpression();
      
      // Skip if already at target
      if (startExpression === targetExpression) {
        resolve();
        return;
      }

      const startTime = Date.now();
      
      this.currentTransition = {
        currentExpression: startExpression,
        targetExpression,
        progress: 0,
        duration,
        startTime
      };

      const animate = () => {
        if (!this.currentTransition) {
          resolve();
          return;
        }

        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Apply easing function
        const easedProgress = this.easeInOutCubic(progress);
        
        this.currentTransition.progress = easedProgress;

        // Blend expressions
        const blendedExpression = this.blendExpressions(
          startExpression,
          targetExpression,
          easedProgress
        );

        // Apply the blended expression
        this.applyMorphTargets(blendedExpression);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          this.currentTransition = null;
          resolve();
        }
      };

      requestAnimationFrame(animate);
    });
  }

  /**
   * Blend two expressions based on progress
   */
  private blendExpressions(
    fromExpression: string,
    toExpression: string,
    progress: number
  ): BlendedExpression {
    const fromValues = facialExpressions[fromExpression] || {};
    const toValues = facialExpressions[toExpression] || {};
    
    const blended: BlendedExpression = {};
    
    // Get all unique morph target keys
    const allKeys = new Set([
      ...Object.keys(fromValues),
      ...Object.keys(toValues)
    ]);

    allKeys.forEach(key => {
      const fromValue = fromValues[key] || 0;
      const toValue = toValues[key] || 0;
      
      // Linear interpolation with easing
      blended[key] = fromValue + (toValue - fromValue) * progress;
    });

    return blended;
  }

  /**
   * Get current expression name (for debugging/logging)
   */
  private getCurrentExpression(): string {
    return this.currentTransition?.targetExpression || 'default';
  }

  /**
   * Cubic ease-in-out easing function
   */
  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  }

  /**
   * Interrupt current transition and start a new one
   */
  async forceTransition(targetExpression: string, duration: number = 800): Promise<void> {
    // Clear queue and current transition
    this.transitionQueue.length = 0;
    this.currentTransition = null;
    this.isTransitioning = false;

    // Start new transition immediately
    await this.transitionTo(targetExpression, duration, 10); // High priority
  }

  /**
   * Create emotion-based transition with contextual duration
   */
  async emotionTransition(
    fromIntent: EmotionalIntent,
    toIntent: EmotionalIntent,
    targetExpression: string
  ): Promise<void> {
    const duration = this.calculateEmotionTransitionDuration(fromIntent, toIntent);
    await this.transitionTo(targetExpression, duration, 5);
  }

  /**
   * Calculate transition duration based on emotional context
   */
  private calculateEmotionTransitionDuration(
    fromIntent: EmotionalIntent,
    toIntent: EmotionalIntent
  ): number {
    let baseDuration = 800;

    // Dramatic emotional changes need longer transitions
    const dramaticChanges = [
      ['happy', 'sad'], ['excited', 'frustrated'], 
      ['romantic', 'angry'], ['playful', 'serious']
    ];

    const isDramatic = dramaticChanges.some(([from, to]) => 
      (fromIntent.primary === from && toIntent.primary === to) ||
      (fromIntent.primary === to && toIntent.primary === from)
    );

    if (isDramatic) {
      baseDuration = 1500;
    }

    // High intensity changes are faster
    const intensityDifference = Math.abs(fromIntent.intensity - toIntent.intensity);
    if (intensityDifference > 0.5) {
      baseDuration += 300;
    }

    // Context changes affect duration
    if (fromIntent.context !== toIntent.context) {
      baseDuration += 200;
    }

    return Math.max(400, Math.min(2500, baseDuration));
  }

  /**
   * Get current transition state (for debugging)
   */
  getTransitionState(): TransitionState | null {
    return this.currentTransition;
  }

  /**
   * Check if currently transitioning
   */
  isCurrentlyTransitioning(): boolean {
    return this.isTransitioning;
  }

  /**
   * Clear all pending transitions
   */
  clearQueue(): void {
    this.transitionQueue.length = 0;
  }

  /**
   * Create micro-expression overlay (brief expressions that return to base)
   */
  async microExpression(
    microExpression: string,
    duration: number = 500,
    returnExpression: string = 'default'
  ): Promise<void> {
    const currentExpression = this.getCurrentExpression();
    
    // Quick transition to micro expression
    await this.transitionTo(microExpression, duration * 0.3, 8);
    
    // Hold for a moment
    await new Promise(resolve => setTimeout(resolve, duration * 0.4));
    
    // Return to previous or specified expression
    await this.transitionTo(returnExpression || currentExpression, duration * 0.3, 8);
  }

  /**
   * Create expression sequence for complex emotional states
   */
  async expressionSequence(
    expressions: Array<{ name: string; duration: number; holdTime?: number }>
  ): Promise<void> {
    for (const expr of expressions) {
      await this.transitionTo(expr.name, expr.duration, 6);
      
      if (expr.holdTime) {
        await new Promise(resolve => setTimeout(resolve, expr.holdTime));
      }
    }
  }

  /**
   * Create breathing effect (subtle animation during idle)
   */
  startBreathingEffect(baseExpression: string = 'default'): void {
    const breathe = () => {
      if (!this.isTransitioning) {
        // Very subtle breathing animation
        const breathingExpression = this.createBreathingVariant(baseExpression);
        this.applyMorphTargets(breathingExpression);
      }
      
      setTimeout(breathe, 2000 + Math.random() * 1000); // Vary breathing rhythm
    };
    
    breathe();
  }

  /**
   * Create subtle breathing variant of an expression
   */
  private createBreathingVariant(baseExpression: string): BlendedExpression {
    const base = facialExpressions[baseExpression] || {};
    const breathing = { ...base };
    
    // Add very subtle movement
    const breathingIntensity = 0.1;
    const time = Date.now() * 0.001;
    const breathingValue = Math.sin(time) * breathingIntensity;
    
    // Slightly open mouth and move chest
    breathing.mouthOpen = (breathing.mouthOpen || 0) + breathingValue * 0.1;
    breathing.jawOpen = (breathing.jawOpen || 0) + breathingValue * 0.05;
    
    return breathing;
  }

  /**
   * Create random micro-expressions for natural variation
   */
  addNaturalVariation(baseExpression: string, variationIntensity: number = 0.1): void {
    if (this.isTransitioning) return;
    
    const variations = ['eyeSquintLeft', 'eyeSquintRight', 'browInnerUp', 'mouthLeft'];
    const randomVariation = variations[Math.floor(Math.random() * variations.length)];
    
    const current = facialExpressions[baseExpression] || {};
    const varied = { ...current };
    
    // Add small random variation
    varied[randomVariation] = (varied[randomVariation] || 0) + 
      (Math.random() - 0.5) * variationIntensity;
    
    this.applyMorphTargets(varied);
    
    // Return to base after a short time
    setTimeout(() => {
      if (!this.isTransitioning) {
        this.applyMorphTargets(current);
      }
    }, 200 + Math.random() * 300);
  }
}
