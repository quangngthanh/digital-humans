import { EMOTION_GROUPS, ANIMATION_GROUPS, ExpressionGroup } from '@/constants/emotion-groups';
import { facialExpressions } from '@/constant';
import { AnimationCoordinator } from './AnimationCoordinator';

export interface EmotionalIntent {
  primary: string;
  intensity: number;
  context: string;
  duration?: string;
  secondaryEmotion?: string;
}

export interface AvatarState {
  expression: string;
  animation: string;
  transitionDuration: number;
  blendingRatio?: number;
}

export interface MessageData {
  text: string;
  emotionalIntent: EmotionalIntent;
  metadata?: {
    messageLength: number;
    estimatedDuration: number;
    conversationTurn: number;
  };
}

export class ExpressionMapper {
  
  /**
   * Main mapping function: Convert emotional intent to avatar state
   */
  static mapToAvatarState(messageData: MessageData): AvatarState {
    const { emotionalIntent, text, metadata } = messageData;
    
    // Step 1: Select expression based on emotional intent
    const expression = this.selectExpression(emotionalIntent, text);
    
    // Step 2: Select compatible animation
    const animation = this.selectAnimation(expression, emotionalIntent, text, metadata);
    
    // Step 3: Calculate transition duration
    const transitionDuration = this.calculateTransitionDuration(emotionalIntent);
    
    return {
      expression,
      animation,
      transitionDuration
    };
  }

  /**
   * Select appropriate facial expression based on emotional intent
   */
  private static selectExpression(emotionalIntent: EmotionalIntent, messageText: string): string {
    const { primary, intensity, context, secondaryEmotion } = emotionalIntent;
    
    // Get emotion group for primary emotion
    const emotionGroup = EMOTION_GROUPS[primary.toLowerCase()];
    
    if (!emotionGroup) {
      console.warn(`Unknown emotion: ${primary}, using default`);
      return 'default';
    }

    // Step 1: Try contextual variants first (highest priority)
    const contextualExpression = this.getContextualExpression(emotionGroup, context, messageText);
    if (contextualExpression) {
      return this.validateExpression(contextualExpression);
    }

    // Step 2: Use intensity-based selection
    const intensityLevel = this.categorizeIntensity(intensity);
    const intensityExpressions = emotionGroup.intensityLevels[intensityLevel];
    
    if (intensityExpressions && intensityExpressions.length > 0) {
      // Select best expression from intensity group
      const selectedExpression = this.selectOptimalExpression(intensityExpressions, messageText);
      return this.validateExpression(selectedExpression);
    }

    // Step 3: Fallback to medium intensity
    const fallbackExpressions = emotionGroup.intensityLevels.medium;
    if (fallbackExpressions && fallbackExpressions.length > 0) {
      return this.validateExpression(fallbackExpressions[0]);
    }

    // Step 4: Final fallback
    return 'default';
  }

  /**
   * Get contextual expression variant
   */
  private static getContextualExpression(
    emotionGroup: ExpressionGroup, 
    context: string, 
    messageText: string
  ): string | null {
    const contextVariants = emotionGroup.contextualVariants;
    
    // Direct context match
    if (contextVariants[context]) {
      const variants = contextVariants[context];
      return this.selectOptimalExpression(variants, messageText);
    }

    // Advanced context detection from message content
    const detectedContext = this.detectAdvancedContext(messageText);
    if (detectedContext && contextVariants[detectedContext]) {
      const variants = contextVariants[detectedContext];
      return this.selectOptimalExpression(variants, messageText);
    }

    return null;
  }

  /**
   * Detect additional context clues from message text
   */
  private static detectAdvancedContext(messageText: string): string | null {
    const text = messageText.toLowerCase();
    
    const contextPatterns = {
      joke: /haha|lol|funny|joke|silly|ridiculous/i,
      affection: /love|heart|sweet|cute|adorable/i,
      excitement: /wow|amazing|incredible|awesome|fantastic/i,
      concern: /worry|concern|problem|trouble|difficult/i,
      compliment: /beautiful|gorgeous|handsome|pretty|lovely/i,
      question: /\?|why|how|what|when|where|who/i
    };

    for (const [context, pattern] of Object.entries(contextPatterns)) {
      if (pattern.test(text)) {
        return context;
      }
    }

    return null;
  }

  /**
   * Select optimal expression from a list based on message characteristics
   */
  private static selectOptimalExpression(expressions: string[], messageText: string): string {
    if (expressions.length === 1) {
      return expressions[0];
    }

    // Selection based on message characteristics
    const text = messageText.toLowerCase();
    
    // Prioritize based on text content
    if (text.includes('!') && expressions.includes('excited')) return 'excited';
    if (text.includes('?') && expressions.includes('curious')) return 'curious';
    if (text.includes('love') && expressions.includes('flirtatious')) return 'flirtatious';
    if (text.includes('haha') && expressions.includes('laughing')) return 'laughing';
    
    // Default to first expression
    return expressions[0];
  }

  /**
   * Categorize intensity level
   */
  private static categorizeIntensity(intensity: number): 'low' | 'medium' | 'high' {
    if (intensity <= 0.4) return 'low';
    if (intensity <= 0.7) return 'medium';
    return 'high';
  }

  /**
   * Validate expression exists in facialExpressions
   */
  private static validateExpression(expression: string): string {
    if (facialExpressions[expression]) {
      return expression;
    }
    
    console.warn(`Expression '${expression}' not found in facialExpressions, using 'default'`);
    return 'default';
  }

  /**
   * Select appropriate animation for the expression using AnimationCoordinator
   */
  private static selectAnimation(
    expression: string, 
    emotionalIntent: EmotionalIntent,
    messageText: string,
    metadata?: any
  ): string {
    // Use the dedicated AnimationCoordinator for intelligent animation selection
    return AnimationCoordinator.selectAnimation(emotionalIntent, messageText, metadata);
  }

  /**
   * Get expression category for animation matching
   */
  private static getExpressionCategory(expression: string): string {
    // Find which emotion group this expression belongs to
    for (const [emotion, group] of Object.entries(EMOTION_GROUPS)) {
      const allExpressions = [
        ...group.intensityLevels.low,
        ...group.intensityLevels.medium,
        ...group.intensityLevels.high,
        ...Object.values(group.contextualVariants).flat()
      ];
      
      if (allExpressions.includes(expression)) {
        return group.category;
      }
    }
    
    return 'basic';
  }

  /**
   * Calculate transition duration based on emotional change
   */
  private static calculateTransitionDuration(emotionalIntent: EmotionalIntent): number {
    const { intensity, duration } = emotionalIntent;
    
    // Base duration
    let transitionMs = 800;
    
    // Adjust for intensity (higher intensity = longer transition)
    transitionMs += intensity * 400;
    
    // Adjust for specified duration
    switch (duration) {
      case 'brief':
        transitionMs *= 0.6;
        break;
      case 'sustained':
        transitionMs *= 1.2;
        break;
      case 'transitional':
        transitionMs *= 0.8;
        break;
    }
    
    // Clamp between 400ms and 2000ms
    return Math.max(400, Math.min(2000, transitionMs));
  }

  /**
   * Create blended expression for complex emotions
   */
  static createBlendedExpression(
    primaryExpression: string, 
    secondaryExpression: string, 
    ratio: number = 0.7
  ): any {
    const primary = facialExpressions[primaryExpression] || {};
    const secondary = facialExpressions[secondaryExpression] || {};
    
    const blended = {};
    const allKeys = new Set([...Object.keys(primary), ...Object.keys(secondary)]);
    
    allKeys.forEach(key => {
      const primaryValue = primary[key] || 0;
      const secondaryValue = secondary[key] || 0;
      blended[key] = primaryValue * ratio + secondaryValue * (1 - ratio);
    });
    
    return blended;
  }

  /**
   * Get suggested animations for future expansion
   */
  static getSuggestedAnimationsForExpression(expression: string): string[] {
    const category = this.getExpressionCategory(expression);
    const emotionGroup = Object.values(EMOTION_GROUPS).find(group => {
      const allExpressions = [
        ...group.intensityLevels.low,
        ...group.intensityLevels.medium,
        ...group.intensityLevels.high,
        ...Object.values(group.contextualVariants).flat()
      ];
      return allExpressions.includes(expression);
    });
    
    return emotionGroup?.animationCompatibility || ['Talking_0'];
  }
}
