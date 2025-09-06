import { Injectable } from '@nestjs/common';
import { ContextType, EmotionType } from '../chat/dto/emotional-intent.dto';
import { ConfigLoaderService, LanguageConfig } from '../config/config-loader.service';

export interface ConversationContext {
  messageType: 'greeting' | 'question' | 'compliment' | 'story' | 'goodbye';
  relationshipTone: 'casual' | 'romantic' | 'playful' | 'intimate' | 'supportive';
  conversationMood: 'light' | 'deep' | 'flirty' | 'serious' | 'comfort';
  userEmotionalState: 'positive' | 'negative' | 'neutral' | 'mixed';
}

export interface ContextAnalysisResult {
  detectedContext: ContextType;
  conversationContext: ConversationContext;
  suggestedIntensity: number;
  keywords: string[];
}

@Injectable()
export class ContextAnalyzerService {
  
  constructor(private readonly configLoader: ConfigLoaderService) {}
  
  /**
   * Analyze user message to extract context and emotional cues
   */
  analyzeMessage(message: string, language: string = 'vietnamese'): ContextAnalysisResult {
    const normalizedMessage = message.toLowerCase().trim();
    const languageConfig = this.configLoader.getLanguageConfig(language);
    
    const messageType = this.detectMessageType(normalizedMessage, languageConfig);
    const relationshipTone = this.detectRelationshipTone(normalizedMessage, languageConfig);
    const conversationMood = this.detectConversationMood(normalizedMessage, languageConfig);
    const userEmotionalState = this.detectUserEmotionalState(normalizedMessage, languageConfig);
    const detectedContext = this.mapToContextType(messageType, relationshipTone);
    const suggestedIntensity = this.calculateIntensity(normalizedMessage, languageConfig);
    const keywords = this.extractEmotionalKeywords(normalizedMessage, languageConfig);

    return {
      detectedContext,
      conversationContext: {
        messageType,
        relationshipTone,
        conversationMood,
        userEmotionalState
      },
      suggestedIntensity,
      keywords
    };
  }

  /**
   * Detect the type of message using config patterns
   */
  private detectMessageType(message: string, languageConfig: LanguageConfig): ConversationContext['messageType'] {
    const patterns = languageConfig.contextPatterns;
    
    // Check greeting patterns
    if (patterns.greeting) {
      const greetingPatterns = [
        ...(patterns.greeting.morning || []),
        ...(patterns.greeting.general || []),
        ...(patterns.greeting.casual || []),
        ...(patterns.greeting.formal || [])
      ];
      
      if (greetingPatterns.some(pattern => message.includes(pattern.toLowerCase()))) {
        return 'greeting';
      }
    }

    // Check goodbye patterns
    if (patterns.goodbye) {
      const goodbyePatterns = [
        ...(patterns.goodbye.formal || []),
        ...(patterns.goodbye.casual || []),
        ...(patterns.goodbye.romantic || []),
        ...(patterns.goodbye.abrupt || [])
      ];
      
      if (goodbyePatterns.some(pattern => message.includes(pattern.toLowerCase()))) {
        return 'goodbye';
      }
    }

    // Check question patterns
    if (patterns.question && patterns.question.patterns) {
      const questionPatterns = [
        ...patterns.question.patterns,
        ...(patterns.question.casual || []),
        ...(patterns.question.seeking_help || [])
      ];
      
      if (questionPatterns.some(pattern => {
        if (pattern.startsWith('\\')) {
          return new RegExp(pattern).test(message);
        }
        return message.includes(pattern.toLowerCase());
      })) {
        return 'question';
      }
    }

    // Check compliment patterns
    if (patterns.compliment) {
      const complimentPatterns = [
        ...(patterns.compliment.appearance || []),
        ...(patterns.compliment.personality || []),
        ...(patterns.compliment.general || []),
        ...(patterns.compliment.slang || [])
      ];
      
      if (complimentPatterns.some(pattern => message.includes(pattern.toLowerCase()))) {
        return 'compliment';
      }
    }

    return 'story'; // Default
  }

  /**
   * Detect relationship tone from the message using config
   */
  private detectRelationshipTone(message: string, languageConfig: LanguageConfig): ConversationContext['relationshipTone'] {
    const relationshipTerms = languageConfig.culturalContext.relationshipTerms;
    
    // Check for romantic terms
    if (relationshipTerms.romantic && relationshipTerms.romantic.some(term => 
      message.includes(term.toLowerCase())
    )) {
      return 'romantic';
    }

    // Check flirting patterns
    const patterns = languageConfig.contextPatterns;
    if (patterns.flirting) {
      const flirtingPatterns = [
        ...(patterns.flirting.direct || []),
        ...(patterns.flirting.subtle || []),
        ...(patterns.flirting.playful || []),
        ...(patterns.flirting.intimate || [])
      ];
      
      if (flirtingPatterns.some(pattern => message.includes(pattern.toLowerCase()))) {
        return 'playful';
      }
    }

    // Check for comfort/support patterns
    if (patterns.comfort) {
      const comfortPatterns = [
        ...(patterns.comfort.support || []),
        ...(patterns.comfort.empathy || []),
        ...(patterns.comfort.encouragement || [])
      ];
      
      if (comfortPatterns.some(pattern => message.includes(pattern.toLowerCase()))) {
        return 'supportive';
      }
    }

    // Check formal terms
    if (relationshipTerms.formal && relationshipTerms.formal.some(term => 
      message.includes(term.toLowerCase())
    )) {
      return 'intimate'; // In Vietnamese context, formal can indicate respectful intimacy
    }

    return 'casual'; // Default
  }

  /**
   * Detect conversation mood using config patterns
   */
  private detectConversationMood(message: string, languageConfig: LanguageConfig): ConversationContext['conversationMood'] {
    const emotionKeywords = languageConfig.emotionKeywords;
    
    // Check for playful/flirty mood
    if (emotionKeywords.playful) {
      const playfulPatterns = [
        ...(emotionKeywords.playful.primary || []),
        ...(emotionKeywords.playful.slang || []),
        ...(emotionKeywords.playful.expressions || [])
      ];
      
      if (playfulPatterns.some(pattern => message.includes(pattern.toLowerCase()))) {
        return 'flirty';
      }
    }

    // Check for caring/comfort mood
    if (emotionKeywords.caring) {
      const caringPatterns = [
        ...(emotionKeywords.caring.primary || []),
        ...(emotionKeywords.caring.expressions || []),
        ...(emotionKeywords.caring.actions || [])
      ];
      
      if (caringPatterns.some(pattern => message.includes(pattern.toLowerCase()))) {
        return 'comfort';
      }
    }

    // Check for sad emotions indicating need for comfort
    if (emotionKeywords.sad) {
      const sadPatterns = [
        ...(emotionKeywords.sad.primary || []),
        ...(emotionKeywords.sad.expressions || [])
      ];
      
      if (sadPatterns.some(pattern => message.includes(pattern.toLowerCase()))) {
        return 'comfort';
      }
    }

    // Check question patterns for serious mood
    const patterns = languageConfig.contextPatterns;
    if (patterns.question && patterns.question.seeking_help) {
      if (patterns.question.seeking_help.some(pattern => message.includes(pattern.toLowerCase()))) {
        return 'serious';
      }
    }

    return 'light'; // Default
  }

  /**
   * Detect user's emotional state using config
   */
  private detectUserEmotionalState(message: string, languageConfig: LanguageConfig): ConversationContext['userEmotionalState'] {
    const emotionKeywords = languageConfig.emotionKeywords;
    let positiveScore = 0;
    let negativeScore = 0;

    // Check positive emotions
    ['happy', 'excited', 'romantic', 'playful'].forEach(emotion => {
      if (emotionKeywords[emotion]) {
        const patterns = [
          ...(emotionKeywords[emotion].primary || []),
          ...(emotionKeywords[emotion].slang || []),
          ...(emotionKeywords[emotion].expressions || [])
        ];
        
        patterns.forEach(pattern => {
          if (message.includes(pattern.toLowerCase())) {
            positiveScore++;
          }
        });
      }
    });

    // Check negative emotions
    ['sad', 'frustrated'].forEach(emotion => {
      if (emotionKeywords[emotion]) {
        const patterns = [
          ...(emotionKeywords[emotion].primary || []),
          ...(emotionKeywords[emotion].slang || []),
          ...(emotionKeywords[emotion].expressions || [])
        ];
        
        patterns.forEach(pattern => {
          if (message.includes(pattern.toLowerCase())) {
            negativeScore++;
          }
        });
      }
    });

    if (positiveScore > 0 && negativeScore > 0) return 'mixed';
    if (positiveScore > negativeScore) return 'positive';
    if (negativeScore > positiveScore) return 'negative';
    
    return 'neutral';
  }

  /**
   * Map message characteristics to ContextType
   */
  private mapToContextType(messageType: string, relationshipTone: string): ContextType {
    if (messageType === 'greeting') return ContextType.GREETING;
    if (messageType === 'goodbye') return ContextType.GOODBYE;
    if (messageType === 'question') return ContextType.QUESTION;
    if (messageType === 'compliment') return ContextType.COMPLIMENT;
    if (relationshipTone === 'romantic' || relationshipTone === 'playful') return ContextType.FLIRTING;
    if (relationshipTone === 'supportive') return ContextType.COMFORT;
    
    return ContextType.CASUAL;
  }

  /**
   * Calculate emotional intensity based on config modifiers
   */
  private calculateIntensity(message: string, languageConfig: LanguageConfig): number {
    let intensity = 0.5; // Base intensity
    const modifiers = languageConfig.intensityModifiers;

    // Check amplifiers
    if (modifiers.amplifiers) {
      Object.entries(modifiers.amplifiers).forEach(([level, words]) => {
        words.forEach(word => {
          if (message.includes(word.toLowerCase())) {
            intensity += level === 'high' ? 0.3 : level === 'medium' ? 0.2 : 0.1;
          }
        });
      });
    }

    // Check diminishers
    if (modifiers.diminishers) {
      Object.entries(modifiers.diminishers).forEach(([level, words]) => {
        words.forEach(word => {
          if (message.includes(word.toLowerCase())) {
            intensity -= level === 'low' ? 0.1 : 0.15;
          }
        });
      });
    }

    // Check punctuation patterns
    if (modifiers.punctuationPatterns) {
      Object.entries(modifiers.punctuationPatterns).forEach(([type, patterns]) => {
        patterns.forEach(pattern => {
          if (pattern.startsWith('[') || pattern.includes('\\')) {
            // Regex pattern
            if (new RegExp(pattern).test(message)) {
              intensity += type === 'excitement' ? 0.2 : 0.1;
            }
          } else if (message.includes(pattern)) {
            intensity += 0.15;
          }
        });
      });
    }

    // Clamp between 0.1 and 1.0
    return Math.max(0.1, Math.min(1.0, intensity));
  }

  /**
   * Extract emotional keywords using config patterns
   */
  private extractEmotionalKeywords(message: string, languageConfig: LanguageConfig): string[] {
    const keywords: string[] = [];
    const emotionKeywords = languageConfig.emotionKeywords;

    Object.entries(emotionKeywords).forEach(([emotion, emotionConfig]) => {
      // Check all keyword categories
      ['primary', 'slang', 'expressions', 'terms', 'actions'].forEach(category => {
        if (emotionConfig[category] && Array.isArray(emotionConfig[category])) {
          emotionConfig[category].forEach((keyword: string) => {
            if (message.toLowerCase().includes(keyword.toLowerCase())) {
              keywords.push(keyword);
            }
          });
        }
      });
    });

    return [...new Set(keywords)]; // Remove duplicates
  }

  /**
   * Suggest emotion based on context analysis using config
   */
  suggestEmotion(context: ContextAnalysisResult, languageConfig?: LanguageConfig): EmotionType {
    const { conversationContext, keywords, suggestedIntensity } = context;

    // If language config is provided, use it for better analysis
    if (languageConfig) {
      const emotionKeywords = languageConfig.emotionKeywords;
      let maxScore = 0;
      let suggestedEmotion = EmotionType.HAPPY;

      // Score each emotion based on keyword matches
      Object.entries(emotionKeywords).forEach(([emotion, config]) => {
        let score = 0;
        
        keywords.forEach(keyword => {
          ['primary', 'slang', 'expressions', 'terms', 'actions'].forEach(category => {
            if (config[category] && config[category].includes(keyword)) {
              score += category === 'primary' ? 3 : 2;
            }
          });
        });

        if (score > maxScore) {
          maxScore = score;
          const emotionMap: Record<string, EmotionType> = {
            'happy': EmotionType.HAPPY,
            'sad': EmotionType.SAD,
            'excited': EmotionType.EXCITED,
            'surprised': EmotionType.SURPRISED,
            'frustrated': EmotionType.FRUSTRATED,
            'romantic': EmotionType.ROMANTIC,
            'caring': EmotionType.CARING,
            'playful': EmotionType.PLAYFUL
          };
          
          suggestedEmotion = emotionMap[emotion] || EmotionType.HAPPY;
        }
      });

      if (maxScore > 0) {
        return suggestedEmotion;
      }
    }

    // Fallback to original logic
    if (keywords.some(k => ['love', 'heart', 'romantic', 'kiss', 'yêu', 'thương'].includes(k))) {
      return EmotionType.ROMANTIC;
    }

    if (keywords.some(k => ['fun', 'play', 'silly', 'joke', 'lầy', 'vui nhộn'].includes(k))) {
      return EmotionType.PLAYFUL;
    }

    if (keywords.some(k => ['happy', 'joy', 'excited', 'great', 'vui', 'hạnh phúc'].includes(k))) {
      return suggestedIntensity > 0.7 ? EmotionType.EXCITED : EmotionType.HAPPY;
    }

    if (keywords.some(k => ['sad', 'cry', 'hurt', 'miss', 'buồn', 'khóc'].includes(k))) {
      return EmotionType.SAD;
    }

    if (keywords.some(k => ['angry', 'mad', 'frustrated', 'bực', 'tức'].includes(k))) {
      return EmotionType.FRUSTRATED;
    }

    if (keywords.some(k => ['surprised', 'wow', 'omg', 'ngạc nhiên'].includes(k))) {
      return EmotionType.SURPRISED;
    }

    if (conversationContext.messageType === 'question') {
      return EmotionType.CURIOUS;
    }

    if (conversationContext.relationshipTone === 'supportive') {
      return EmotionType.CARING;
    }

    // Default based on mood
    switch (conversationContext.conversationMood) {
      case 'flirty':
        return EmotionType.MISCHIEVOUS;
      case 'serious':
        return EmotionType.SERIOUS;
      case 'deep':
        return EmotionType.THOUGHTFUL;
      default:
        return EmotionType.HAPPY;
    }
  }
}
