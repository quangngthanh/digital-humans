import { ANIMATION_GROUPS } from '@/constants/emotion-groups';
import { AnimationLoader } from './AnimationLoader';
import type { EmotionalIntent, MessageMetadata } from '@/types';

export interface AnimationRule {
  condition: (intent: EmotionalIntent, text: string, metadata?: MessageMetadata) => boolean;
  animation: string;
  priority: number;
  category: 'conversation' | 'emotion' | 'social' | 'movement' | 'idle' | 'cognitive';
  intensity: 'low' | 'medium' | 'high';
  mood?: string;
}

// Animation configuration with separate file support
export const SEPARATE_ANIMATION_CONFIG = {
  // Conversation animations
  'Talking_0': { category: 'conversation' as const, mood: 'neutral', intensity: 'low' as const, file: 'Talking_0' },
  'Talking_1': { category: 'conversation' as const, mood: 'engaged', intensity: 'medium' as const, file: 'Talking_1' },
  'Talking_2': { category: 'conversation' as const, mood: 'animated', intensity: 'high' as const, file: 'Talking_2' },
  'Sitting Talking': { category: 'conversation' as const, mood: 'casual', intensity: 'low' as const, file: 'Sitting Talking' },
  'Telling A Secret': { category: 'conversation' as const, mood: 'intimate', intensity: 'medium' as const, file: 'Telling A Secret' },
  
  // Emotional animations
  'Laughing': { category: 'emotion' as const, mood: 'happy', intensity: 'high' as const, file: 'Laughing' },
  'Crying': { category: 'emotion' as const, mood: 'sad', intensity: 'high' as const, file: 'Crying' },
  'Terrified': { category: 'emotion' as const, mood: 'fear', intensity: 'high' as const, file: 'Terrified' },
  'Thankful': { category: 'emotion' as const, mood: 'grateful', intensity: 'medium' as const, file: 'Thankful' },
  
  // Movement/idle animations
  'Standing Idle': { category: 'idle' as const, mood: 'neutral', intensity: 'low' as const, file: 'Standing Idle' },
  'Looking': { category: 'idle' as const, mood: 'curious', intensity: 'low' as const, file: 'Looking' },
  'Thinking': { category: 'cognitive' as const, mood: 'thoughtful', intensity: 'medium' as const, file: 'Thinking' },
  
  // Social animations
  'Rumba Dancing': { category: 'social' as const, mood: 'playful', intensity: 'high' as const, file: 'Rumba Dancing' },
  'Hip Hop Dancing': { category: 'social' as const, mood: 'energetic', intensity: 'high' as const, file: 'Hip Hop Dancing' },
  'Chicken Dance': { category: 'social' as const, mood: 'silly', intensity: 'high' as const, file: 'Chicken Dance' },
  
  // Walking animations (for future use)
  'Walking': { category: 'movement' as const, mood: 'neutral', intensity: 'medium' as const, file: 'Walking' },
  'Start Walking': { category: 'movement' as const, mood: 'neutral', intensity: 'medium' as const, file: 'Start Walking' },
  'Stop Walking': { category: 'movement' as const, mood: 'neutral', intensity: 'medium' as const, file: 'Stop Walking' },
  'Female Start Walking': { category: 'movement' as const, mood: 'feminine', intensity: 'medium' as const, file: 'Female Start Walking' },
  'Female Stop Walking': { category: 'movement' as const, mood: 'feminine', intensity: 'medium' as const, file: 'Female Stop Walking' },
  'Female Stop And Start Walking': { category: 'movement' as const, mood: 'feminine', intensity: 'medium' as const, file: 'Female Stop And Start Walking' },
  'Walk In Circle': { category: 'movement' as const, mood: 'restless', intensity: 'medium' as const, file: 'Walk In Circle' },
  'Walking Turn 180': { category: 'movement' as const, mood: 'decisive', intensity: 'medium' as const, file: 'Walking Turn 180' },
};

export type AnimationName = keyof typeof SEPARATE_ANIMATION_CONFIG;

export class AnimationCoordinator {
  private static animationLoader = AnimationLoader.getInstance();
  
  // Enhanced animation rules with separate file support
  private static readonly PRIORITY_RULES: AnimationRule[] = [
    // High intensity emotional expressions
    {
      condition: (intent, text) => intent.primary === 'happy' && intent.intensity > 0.8,
      animation: 'Laughing',
      priority: 10,
      category: 'emotion',
      intensity: 'high'
    },
    {
      condition: (intent, text) => intent.primary === 'sad' && intent.intensity > 0.7,
      animation: 'Crying',
      priority: 10,
      category: 'emotion',
      intensity: 'high'
    },
    {
      condition: (intent, text) => intent.primary === 'excited' && intent.intensity > 0.8,
      animation: 'Laughing',
      priority: 9,
      category: 'emotion',
      intensity: 'high'
    },
    {
      condition: (intent, text) => intent.primary === 'surprised' && intent.intensity > 0.8,
      animation: 'Terrified',
      priority: 9,
      category: 'emotion',
      intensity: 'high'
    },
    
    // Social/playful animations
    {
      condition: (intent, text) => intent.primary === 'playful' && intent.intensity > 0.7,
      animation: 'Rumba Dancing',
      priority: 8,
      category: 'social',
      intensity: 'high'
    },
    {
      condition: (intent, text) => intent.primary === 'mischievous' && intent.intensity > 0.6,
      animation: 'Chicken Dance',
      priority: 8,
      category: 'social',
      intensity: 'high'
    },
    {
      condition: (intent, text) => intent.primary === 'confident' && intent.intensity > 0.7,
      animation: 'Hip Hop Dancing',
      priority: 7,
      category: 'social',
      intensity: 'high'
    },
    
    // Romantic/intimate animations
    {
      condition: (intent, text) => intent.primary === 'romantic' && intent.context === 'flirting',
      animation: 'Telling A Secret',
      priority: 7,
      category: 'conversation',
      intensity: 'medium'
    },
    {
      condition: (intent, text) => intent.primary === 'romantic' && intent.intensity > 0.6,
      animation: 'Rumba Dancing',
      priority: 6,
      category: 'social',
      intensity: 'high'
    },
    
    // Caring/supportive animations
    {
      condition: (intent, text) => intent.primary === 'caring' && intent.context === 'comfort',
      animation: 'Thankful',
      priority: 6,
      category: 'emotion',
      intensity: 'medium'
    },
    
    // Cognitive states
    {
      condition: (intent, text) => intent.primary === 'thoughtful' || intent.primary === 'curious',
      animation: 'Thinking',
      priority: 5,
      category: 'cognitive',
      intensity: 'medium'
    },
    {
      condition: (intent, text) => intent.primary === 'confused' || (intent.context === 'question' && intent.intensity > 0.5),
      animation: 'Looking',
      priority: 5,
      category: 'idle',
      intensity: 'low'
    },
    
    // Conversation context rules
    {
      condition: (intent, text) => intent.context === 'greeting' && intent.intensity > 0.6,
      animation: 'Talking_2',
      priority: 4,
      category: 'conversation',
      intensity: 'high'
    },
    {
      condition: (intent, text) => intent.context === 'compliment',
      animation: 'Thankful',
      priority: 4,
      category: 'emotion',
      intensity: 'medium'
    },
    
    // Text-based rules
    {
      condition: (intent, text) => this.hasLaughter(text),
      animation: 'Laughing',
      priority: 9,
      category: 'emotion',
      intensity: 'high'
    },
    {
      condition: (intent, text) => this.hasQuestionMarks(text) && intent.primary === 'curious',
      animation: 'Looking',
      priority: 3,
      category: 'idle',
      intensity: 'low'
    },
    
    // Message length considerations
    {
      condition: (intent, text, metadata) => 
        metadata && metadata.messageLength > 100 && intent.intensity > 0.6,
      animation: 'Talking_2',
      priority: 2,
      category: 'conversation',
      intensity: 'high'
    },
    {
      condition: (intent, text, metadata) => 
        metadata && metadata.messageLength < 20 && intent.intensity < 0.4,
      animation: 'Talking_0',
      priority: 2,
      category: 'conversation',
      intensity: 'low'
    }
  ];

  /**
   * Select appropriate animation based on emotional intent and context
   */
  static selectAnimation(
    emotionalIntent: EmotionalIntent,
    messageText: string,
    metadata?: MessageMetadata
  ): string {
    console.log('Selecting animation for:', {
      emotion: emotionalIntent.primary,
      intensity: emotionalIntent.intensity,
      context: emotionalIntent.context,
      textLength: messageText.length
    });

    // Apply priority rules in order
    const matchingRules = this.PRIORITY_RULES
      .filter(rule => rule.condition(emotionalIntent, messageText, metadata))
      .sort((a, b) => b.priority - a.priority);

    if (matchingRules.length > 0) {
      const selectedRule = matchingRules[0];
      console.log(`Selected animation: ${selectedRule.animation} (priority: ${selectedRule.priority})`);
      
      // Preload the animation
      this.preloadAnimation(selectedRule.animation);
      
      return selectedRule.animation;
    }

    // Fallback to intensity-based selection
    const fallbackAnimation = this.selectByIntensityAndEmotion(emotionalIntent);
    console.log(`Fallback animation: ${fallbackAnimation}`);
    
    // Preload the fallback animation
    this.preloadAnimation(fallbackAnimation);
    
    return fallbackAnimation;
  }

  /**
   * Preload animation asynchronously
   */
  private static async preloadAnimation(animationName: string): Promise<void> {
    try {
      await this.animationLoader.loadAnimation(animationName);
    } catch (error) {
      console.warn(`Failed to preload animation: ${animationName}`, error);
    }
  }

  /**
   * Select animation based on intensity and emotion type
   */
  private static selectByIntensityAndEmotion(intent: EmotionalIntent): string {
    const { primary, intensity } = intent;
    
    // Map emotions to animation candidates
    const emotionAnimations: Record<string, string[]> = {
      happy: intensity > 0.7 ? ['Laughing', 'Rumba Dancing'] : ['Talking_2', 'Talking_1'],
      excited: ['Laughing', 'Hip Hop Dancing', 'Talking_2'],
      playful: ['Rumba Dancing', 'Chicken Dance', 'Talking_2'],
      romantic: ['Rumba Dancing', 'Telling A Secret', 'Talking_1'],
      sad: intensity > 0.7 ? ['Crying'] : ['Talking_0', 'Looking'],
      frustrated: ['Talking_0', 'Looking'],
      surprised: intensity > 0.8 ? ['Terrified'] : ['Looking', 'Talking_1'],
      caring: ['Thankful', 'Telling A Secret', 'Talking_1'],
      thoughtful: ['Thinking', 'Looking', 'Talking_0'],
      curious: ['Looking', 'Thinking', 'Talking_1'],
      confident: ['Hip Hop Dancing', 'Talking_2'],
      shy: ['Talking_0', 'Looking'],
      mischievous: ['Chicken Dance', 'Rumba Dancing', 'Talking_2'],
      serious: ['Talking_0', 'Thinking']
    };

    const candidates = emotionAnimations[primary] || ['Talking_1'];
    
    // Select based on intensity if multiple candidates
    if (candidates.length > 1) {
      if (intensity > 0.7) {
        return candidates[0]; // High intensity animation
      } else if (intensity > 0.4) {
        return candidates[Math.min(1, candidates.length - 1)]; // Medium intensity
      } else {
        return candidates[candidates.length - 1]; // Low intensity
      }
    }
    
    return candidates[0];
  }

  /**
   * Get animation suggestions for debugging
   */
  static getAnimationSuggestions(
    emotionalIntent: EmotionalIntent,
    messageText: string,
    metadata?: MessageMetadata
  ): { animation: string; reason: string; priority: number }[] {
    return this.PRIORITY_RULES
      .filter(rule => rule.condition(emotionalIntent, messageText, metadata))
      .sort((a, b) => b.priority - a.priority)
      .map(rule => ({
        animation: rule.animation,
        reason: `${rule.category} - ${rule.intensity} intensity`,
        priority: rule.priority
      }));
  }

  /**
   * Check if animation is available
   */
  static async isAnimationAvailable(animationName: string): Promise<boolean> {
    try {
      const clip = await this.animationLoader.loadAnimation(animationName);
      return clip !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Preload commonly used animations
   */
  static async preloadCommonAnimations(): Promise<void> {
    const commonAnimations = [
      'Talking_0', 'Talking_1', 'Talking_2',
      'Standing Idle', 'Looking', 'Thinking',
      'Laughing', 'Thankful'
    ];

    console.log('Preloading common animations...');
    await this.animationLoader.preloadAnimations(commonAnimations);
    console.log('Common animations preloaded');
  }

  /**
   * Get animation metadata
   */
  static getAnimationMetadata(animationName: string): typeof SEPARATE_ANIMATION_CONFIG[AnimationName] | null {
    return SEPARATE_ANIMATION_CONFIG[animationName as AnimationName] || null;
  }

  /**
   * Get all available animations by category
   */
  static getAnimationsByCategory(category: string): string[] {
    return Object.entries(SEPARATE_ANIMATION_CONFIG)
      .filter(([_, config]) => config.category === category)
      .map(([name, _]) => name);
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): { cached: number; loading: number; memoryUsage: string } {
    return this.animationLoader.getCacheStats();
  }

  // Helper methods for text analysis
  private static hasLaughter(text: string): boolean {
    const laughterPatterns = /\b(haha|hehe|hihi|lol|lmao|😂|🤣|😄|😆)\b/i;
    return laughterPatterns.test(text);
  }

  private static hasQuestionMarks(text: string): boolean {
    return text.includes('?') || text.includes('🤔');
  }

  private static hasExcitement(text: string): boolean {
    return /[!]{2,}/.test(text) || /\b(wow|amazing|incredible|awesome)\b/i.test(text);
  }

  private static hasIntimateLanguage(text: string): boolean {
    const intimatePatterns = /\b(love|heart|kiss|miss|close|together|yêu|thương|nhớ)\b/i;
    return intimatePatterns.test(text);
  }

  /**
   * Get recommended crossfade duration based on animation types
   */
  static getCrossfadeDuration(fromAnimation: string, toAnimation: string): number {
    const fromConfig = SEPARATE_ANIMATION_CONFIG[fromAnimation as AnimationName];
    const toConfig = SEPARATE_ANIMATION_CONFIG[toAnimation as AnimationName];
    
    if (!fromConfig || !toConfig) return 0.5; // Default
    
    // Same category transitions are smoother
    if (fromConfig.category === toConfig.category) {
      return 0.3;
    }
    
    // Emotional to emotional needs more time
    if (fromConfig.category === 'emotion' && toConfig.category === 'emotion') {
      return 0.8;
    }
    
    // Movement animations need longer transitions
    if (fromConfig.category === 'movement' || toConfig.category === 'movement') {
      return 1.0;
    }
    
    return 0.5; // Default crossfade
  }
}