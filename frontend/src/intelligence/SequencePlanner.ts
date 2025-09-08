/**
 * SequencePlanner - Intelligent animation sequence planning
 * Plans animation sequences to match or exceed audio duration with appropriate emotions
 */

import { 
  ANIMATION_GROUPS, 
  SEQUENCE_PATTERNS, 
  EMOTION_ANIMATION_MAPPING,
  DURATION_HELPERS,
  AnimationGroup,
  SequenceRule
} from '@/constants/animation-registry';

import type { EmotionalIntent } from '@/types';

export interface SequencePlanningInput {
  emotionalIntent: EmotionalIntent;
  audioDuration: number;
  messageLength: number;
  context: MessageContext;
  metadata?: any;
}

export interface MessageContext {
  messageType: 'greeting' | 'question' | 'statement' | 'goodbye' | 'gratitude';
  relationshipTone: 'casual' | 'romantic' | 'formal' | 'intimate' | 'playful';
  hasQuestion: boolean;
  hasExclamation: boolean;
  wordCount: number;
}

export interface AnimationSequence {
  animations: AnimationStep[];
  totalDuration: number;
  audioDuration: number;
  buffer: number;
  confidence: number;
}

export interface AnimationStep {
  animation: string;
  startTime: number;
  duration: number;
  crossfadeIn: number;
  crossfadeOut: number;
  expression?: string;
  reason: string;
}

export interface PlanningStrategy {
  name: string;
  priority: number;
  condition: (input: SequencePlanningInput) => boolean;
  execute: (input: SequencePlanningInput) => Promise<AnimationSequence>;
}

export class SequencePlanner {
  private strategies: PlanningStrategy[] = [];
  private animationDurations: Map<string, number> = new Map();

  constructor() {
    this.initializeStrategies();
    this.initializeAnimationDurations();
    console.log('📋 SequencePlanner initialized');
  }

  /**
   * Plan animation sequence for given input
   */
  async planSequence(input: SequencePlanningInput): Promise<AnimationSequence> {
    console.log('📋 Planning sequence for:', {
      emotion: input.emotionalIntent.primary,
      intensity: input.emotionalIntent.intensity,
      audioDuration: input.audioDuration,
      messageType: input.context.messageType
    });

    try {
      // Find best planning strategy
      const strategy = this.selectBestStrategy(input);
      console.log(`📋 Using strategy: ${strategy.name}`);

      // Execute strategy
      const sequence = await strategy.execute(input);

      // Validate and optimize sequence
      const optimizedSequence = this.optimizeSequence(sequence, input);

      console.log('📋 Planned sequence:', {
        animations: optimizedSequence.animations.map(a => `${a.animation}(${a.duration.toFixed(1)}s)`),
        totalDuration: optimizedSequence.totalDuration.toFixed(2),
        audioDuration: optimizedSequence.audioDuration.toFixed(2),
        buffer: optimizedSequence.buffer.toFixed(2),
        confidence: optimizedSequence.confidence
      });

      return optimizedSequence;

    } catch (error: any) {
      console.error('❌ Sequence planning failed:', error);
      return this.createFallbackSequence(input);
    }
  }

  /**
   * Initialize planning strategies
   */
  private initializeStrategies(): void {
    this.strategies = [
      // Emotional reaction strategy
      {
        name: 'emotional_reaction',
        priority: 10,
        condition: (input) => input.emotionalIntent.intensity > 0.7,
        execute: this.planEmotionalSequence.bind(this)
      },

      // Social/expressive strategy
      {
        name: 'social_expressive',
        priority: 8,
        condition: (input) => ['playful', 'excited', 'romantic'].includes(input.emotionalIntent.primary) && input.audioDuration > 5,
        execute: this.planSocialSequence.bind(this)
      },

      // Long conversation strategy
      {
        name: 'long_conversation',
        priority: 6,
        condition: (input) => input.audioDuration > 8,
        execute: this.planLongConversationSequence.bind(this)
      },

      // Medium conversation strategy
      {
        name: 'medium_conversation',
        priority: 5,
        condition: (input) => input.audioDuration > 3 && input.audioDuration <= 8,
        execute: this.planMediumConversationSequence.bind(this)
      },

      // Short conversation strategy (fallback)
      {
        name: 'short_conversation',
        priority: 1,
        condition: () => true,
        execute: this.planShortConversationSequence.bind(this)
      }
    ];

    // Sort by priority
    this.strategies.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Initialize animation durations (will be loaded from metadata)
   */
  private initializeAnimationDurations(): void {
    // Default duration estimates (will be replaced by actual metadata)
    const defaultDurations: Record<string, number> = {
      'Talking_0': 3.0,
      'Talking_1': 3.5,
      'Talking_2': 4.0,
      'Sitting Talking': 5.0,
      'Telling A Secret': 4.5,
      'Laughing': 4.0,
      'Crying': 5.0,
      'Terrified': 3.5,
      'Thankful': 3.0,
      'Hip Hop Dancing': 8.0,
      'Rumba Dancing': 10.0,
      'Chicken Dance': 6.0,
      'Standing Idle': 2.0,
      'Looking': 3.0,
      'Thinking': 4.0
    };

    Object.entries(defaultDurations).forEach(([name, duration]) => {
      this.animationDurations.set(name, duration);
    });
  }

  /**
   * Select best strategy for input
   */
  private selectBestStrategy(input: SequencePlanningInput): PlanningStrategy {
    for (const strategy of this.strategies) {
      if (strategy.condition(input)) {
        return strategy;
      }
    }
    
    // Should never reach here due to fallback strategy
    return this.strategies[this.strategies.length - 1];
  }

  /**
   * Plan emotional reaction sequence
   */
  private async planEmotionalSequence(input: SequencePlanningInput): Promise<AnimationSequence> {
    const { emotionalIntent, audioDuration } = input;
    const targetDuration = audioDuration + (audioDuration * DURATION_HELPERS.audioBuffer);
    
    const animations: AnimationStep[] = [];
    let currentTime = 0;

    // Start with emotional reaction
    const emotionalAnimation = this.getEmotionalAnimation(emotionalIntent.primary, emotionalIntent.intensity);
    const emotionalDuration = this.getAnimationDuration(emotionalAnimation);
    
    animations.push({
      animation: emotionalAnimation,
      startTime: currentTime,
      duration: emotionalDuration,
      crossfadeIn: DURATION_HELPERS.crossfades.emotional,
      crossfadeOut: DURATION_HELPERS.crossfades.conversation,
      reason: `High intensity ${emotionalIntent.primary} reaction`
    });
    
    currentTime += emotionalDuration - DURATION_HELPERS.crossfades.conversation;

    // Fill remaining time with conversation
    while (currentTime < targetDuration) {
      const remainingTime = targetDuration - currentTime;
      const conversationAnim = this.selectConversationAnimation(remainingTime, emotionalIntent);
      const conversationDuration = this.getAnimationDuration(conversationAnim);
      
      animations.push({
        animation: conversationAnim,
        startTime: currentTime,
        duration: Math.min(conversationDuration, remainingTime + 0.5),
        crossfadeIn: DURATION_HELPERS.crossfades.conversation,
        crossfadeOut: DURATION_HELPERS.crossfades.conversation,
        reason: 'Conversation continuation'
      });
      
      currentTime += conversationDuration - DURATION_HELPERS.crossfades.conversation;
      
      // Prevent infinite loop
      if (animations.length > 5) break;
    }

    return {
      animations,
      totalDuration: currentTime,
      audioDuration,
      buffer: currentTime - audioDuration,
      confidence: 0.9
    };
  }

  /**
   * Plan social/expressive sequence
   */
  private async planSocialSequence(input: SequencePlanningInput): Promise<AnimationSequence> {
    const { emotionalIntent, audioDuration } = input;
    const targetDuration = audioDuration + (audioDuration * DURATION_HELPERS.audioBuffer);
    
    const animations: AnimationStep[] = [];
    let currentTime = 0;

    // Start with social animation if long enough
    if (audioDuration > 6) {
      const socialAnimation = this.getSocialAnimation(emotionalIntent.primary);
      const socialDuration = Math.min(this.getAnimationDuration(socialAnimation), audioDuration * 0.6);
      
      animations.push({
        animation: socialAnimation,
        startTime: currentTime,
        duration: socialDuration,
        crossfadeIn: DURATION_HELPERS.crossfades.social,
        crossfadeOut: DURATION_HELPERS.crossfades.conversation,
        reason: `Social expression for ${emotionalIntent.primary}`
      });
      
      currentTime += socialDuration - DURATION_HELPERS.crossfades.conversation;
    }

    // Fill with conversation animations
    while (currentTime < targetDuration) {
      const remainingTime = targetDuration - currentTime;
      const conversationAnim = this.selectConversationAnimation(remainingTime, emotionalIntent);
      const conversationDuration = this.getAnimationDuration(conversationAnim);
      
      animations.push({
        animation: conversationAnim,
        startTime: currentTime,
        duration: Math.min(conversationDuration, remainingTime + 0.5),
        crossfadeIn: DURATION_HELPERS.crossfades.conversation,
        crossfadeOut: DURATION_HELPERS.crossfades.conversation,
        reason: 'Social conversation'
      });
      
      currentTime += conversationDuration - DURATION_HELPERS.crossfades.conversation;
      
      if (animations.length > 4) break;
    }

    return {
      animations,
      totalDuration: currentTime,
      audioDuration,
      buffer: currentTime - audioDuration,
      confidence: 0.8
    };
  }

  /**
   * Plan long conversation sequence
   */
  private async planLongConversationSequence(input: SequencePlanningInput): Promise<AnimationSequence> {
    const { emotionalIntent, audioDuration } = input;
    const targetDuration = audioDuration + (audioDuration * DURATION_HELPERS.audioBuffer);
    
    const animations: AnimationStep[] = [];
    let currentTime = 0;

    // Use varied conversation animations
    const conversationAnimations = this.getConversationAnimationPool(emotionalIntent);
    let animIndex = 0;

    while (currentTime < targetDuration) {
      const remainingTime = targetDuration - currentTime;
      const animation = conversationAnimations[animIndex % conversationAnimations.length];
      const duration = this.getAnimationDuration(animation);
      
      animations.push({
        animation,
        startTime: currentTime,
        duration: Math.min(duration, remainingTime + 0.5),
        crossfadeIn: DURATION_HELPERS.crossfades.conversation,
        crossfadeOut: DURATION_HELPERS.crossfades.conversation,
        reason: `Long conversation part ${animIndex + 1}`
      });
      
      currentTime += duration - DURATION_HELPERS.crossfades.conversation;
      animIndex++;
      
      if (animations.length > 6) break;
    }

    return {
      animations,
      totalDuration: currentTime,
      audioDuration,
      buffer: currentTime - audioDuration,
      confidence: 0.7
    };
  }

  /**
   * Plan medium conversation sequence
   */
  private async planMediumConversationSequence(input: SequencePlanningInput): Promise<AnimationSequence> {
    const { emotionalIntent, audioDuration } = input;
    const targetDuration = audioDuration + (audioDuration * DURATION_HELPERS.audioBuffer);
    
    const animations: AnimationStep[] = [];
    let currentTime = 0;

    // 2-3 animations for medium duration
    const conversationAnimations = this.getConversationAnimationPool(emotionalIntent).slice(0, 3);
    
    for (let i = 0; i < conversationAnimations.length && currentTime < targetDuration; i++) {
      const remainingTime = targetDuration - currentTime;
      const animation = conversationAnimations[i];
      const duration = this.getAnimationDuration(animation);
      
      animations.push({
        animation,
        startTime: currentTime,
        duration: Math.min(duration, remainingTime + 0.5),
        crossfadeIn: DURATION_HELPERS.crossfades.conversation,
        crossfadeOut: DURATION_HELPERS.crossfades.conversation,
        reason: `Medium conversation part ${i + 1}`
      });
      
      currentTime += duration - DURATION_HELPERS.crossfades.conversation;
    }

    return {
      animations,
      totalDuration: currentTime,
      audioDuration,
      buffer: currentTime - audioDuration,
      confidence: 0.8
    };
  }

  /**
   * Plan short conversation sequence
   */
  private async planShortConversationSequence(input: SequencePlanningInput): Promise<AnimationSequence> {
    const { emotionalIntent, audioDuration } = input;
    const targetDuration = audioDuration + (audioDuration * DURATION_HELPERS.audioBuffer);
    
    // Single animation for short duration
    const animation = this.selectConversationAnimation(targetDuration, emotionalIntent);
    const duration = Math.max(this.getAnimationDuration(animation), targetDuration);
    
    const animations: AnimationStep[] = [{
      animation,
      startTime: 0,
      duration,
      crossfadeIn: DURATION_HELPERS.crossfades.conversation,
      crossfadeOut: DURATION_HELPERS.crossfades.conversation,
      reason: 'Short single conversation'
    }];

    return {
      animations,
      totalDuration: duration,
      audioDuration,
      buffer: duration - audioDuration,
      confidence: 0.9
    };
  }

  /**
   * Get emotional animation for primary emotion
   */
  private getEmotionalAnimation(emotion: string, intensity: number): string {
    const emotionalMappings: Record<string, string[]> = {
      happy: ['Laughing'],
      excited: ['Laughing'],
      sad: ['Crying'],
      surprised: ['Terrified'],
      grateful: ['Thankful'],
      playful: ['Chicken Dance']
    };

    const options = emotionalMappings[emotion] || [];
    return options[0] || 'Talking_1';
  }

  /**
   * Get social animation for emotion
   */
  private getSocialAnimation(emotion: string): string {
    const socialMappings: Record<string, string> = {
      playful: 'Hip Hop Dancing',
      excited: 'Hip Hop Dancing',
      romantic: 'Rumba Dancing',
      mischievous: 'Chicken Dance'
    };

    return socialMappings[emotion] || 'Hip Hop Dancing';
  }

  /**
   * Select appropriate conversation animation
   */
  private selectConversationAnimation(remainingTime: number, emotionalIntent: EmotionalIntent): string {
    const conversationPool = this.getConversationAnimationPool(emotionalIntent);
    
    // Choose based on remaining time
    if (remainingTime < 3) {
      return 'Talking_0'; // Shortest
    } else if (remainingTime < 5) {
      return 'Talking_1'; // Medium
    } else {
      return conversationPool[Math.floor(Math.random() * conversationPool.length)];
    }
  }

  /**
   * Get conversation animation pool for emotion
   */
  private getConversationAnimationPool(emotionalIntent: EmotionalIntent): string[] {
    const pools: Record<string, string[]> = {
      romantic: ['Talking_2', 'Telling A Secret', 'Sitting Talking'],
      playful: ['Talking_2', 'Talking_1'],
      serious: ['Talking_1', 'Sitting Talking'],
      thoughtful: ['Thinking', 'Talking_1', 'Sitting Talking'],
      default: ['Talking_0', 'Talking_1', 'Talking_2']
    };

    return pools[emotionalIntent.primary] || pools.default;
  }

  /**
   * Get animation duration
   */
  private getAnimationDuration(animationName: string): number {
    return this.animationDurations.get(animationName) || 3.0;
  }

  /**
   * Optimize sequence
   */
  private optimizeSequence(sequence: AnimationSequence, input: SequencePlanningInput): AnimationSequence {
    // Ensure minimum buffer
    const minBuffer = input.audioDuration * 0.05; // 5% minimum
    if (sequence.buffer < minBuffer) {
      const lastAnimation = sequence.animations[sequence.animations.length - 1];
      if (lastAnimation) {
        lastAnimation.duration += minBuffer - sequence.buffer;
        sequence.totalDuration += minBuffer - sequence.buffer;
        sequence.buffer = minBuffer;
      }
    }

    // Validate crossfade times
    sequence.animations.forEach((anim, index) => {
      if (index > 0) {
        const prevAnim = sequence.animations[index - 1];
        const maxCrossfade = Math.min(anim.crossfadeIn, prevAnim.crossfadeOut, prevAnim.duration * 0.3);
        anim.crossfadeIn = maxCrossfade;
        prevAnim.crossfadeOut = maxCrossfade;
      }
    });

    return sequence;
  }

  /**
   * Create fallback sequence
   */
  private createFallbackSequence(input: SequencePlanningInput): AnimationSequence {
    console.log('⚠️ Creating fallback sequence');
    
    const duration = Math.max(input.audioDuration + 1, 3.0);
    
    return {
      animations: [{
        animation: 'Talking_1',
        startTime: 0,
        duration,
        crossfadeIn: 0.3,
        crossfadeOut: 0.3,
        reason: 'Fallback sequence'
      }],
      totalDuration: duration,
      audioDuration: input.audioDuration,
      buffer: duration - input.audioDuration,
      confidence: 0.5
    };
  }

  /**
   * Update animation durations from metadata
   */
  updateAnimationDurations(durations: Map<string, number>): void {
    console.log('📋 Updating animation durations from metadata');
    this.animationDurations = new Map(durations);
  }
}

export default SequencePlanner;