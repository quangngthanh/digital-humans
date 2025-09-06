import { Injectable, Inject, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigLoaderService, LanguageConfig, PromptConfig } from '../config/config-loader.service';
import { ContextAnalyzerService, ConversationContext, ContextAnalysisResult } from './context-analyzer.service';
import { EmotionType, ContextType } from '../chat/dto/emotional-intent.dto';
import { LLMAnalysisRequest, LLMAnalysisResponse } from './dto/llm-context.dto';

@Injectable()
export class LLMContextAnalyzerService {
  private readonly logger = new Logger(LLMContextAnalyzerService.name);
  private readonly cache = new Map<string, LLMAnalysisResponse>();
  private readonly model;

  constructor(
    @Inject('GEMINI_CLIENT') private readonly genAI: GoogleGenerativeAI,
    private readonly configLoader: ConfigLoaderService,
    private readonly fallbackAnalyzer: ContextAnalyzerService,
  ) {
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
  }

  /**
   * Analyze context using LLM with fallback to config-based analysis
   */
  async analyzeContext(request: LLMAnalysisRequest): Promise<LLMAnalysisResponse> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey(request);

    if (this.cache.has(cacheKey)) {
      this.logger.debug('Returning cached LLM analysis');
      return this.cache.get(cacheKey);
    }

    try {
      const llmResult = await this.performLLMAnalysis(request);
      const processingTime = Date.now() - startTime;

      const response: LLMAnalysisResponse = {
        ...llmResult,
        processingTime,
        fallbackUsed: false
      };

      this.cache.set(cacheKey, response);
      this.cleanupCache();

      return response;

    } catch (error) {
      this.logger.warn(`LLM analysis failed: ${error.message}, using fallback`);
      
      // Fallback to config-based analysis
      return this.performFallbackAnalysis(request, Date.now() - startTime);
    }
  }

  /**
   * Perform LLM-based context analysis
   */
  private async performLLMAnalysis(request: LLMAnalysisRequest): Promise<Omit<LLMAnalysisResponse, 'processingTime' | 'fallbackUsed'>> {
    const { message, language, previousContext } = request;
    
    // Get configs
    const languageConfig = this.configLoader.getLanguageConfig(language);
    const promptConfig = this.configLoader.getPromptConfig();

    // Build structured prompt
    const prompt = this.buildAnalysisPrompt(message, languageConfig, promptConfig, previousContext);

    try {
      // Call Gemini API with timeout
      const result = await Promise.race([
        this.model.generateContent(prompt),
        this.createTimeoutPromise(promptConfig.promptOptimization.timeoutMs)
      ]);

      const responseText = result.response.text();
      this.logger.debug(`LLM raw response: ${responseText}`);

      // Parse structured response
      const parsedResponse = this.parseStructuredResponse(responseText, languageConfig);
      
      return parsedResponse;

    } catch (error) {
      this.logger.error(`LLM API call failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Build analysis prompt using config
   */
  private buildAnalysisPrompt(
    message: string, 
    languageConfig: LanguageConfig, 
    promptConfig: PromptConfig, 
    previousContext?: ConversationContext
  ): string {
    const { contextAnalysisPrompt } = promptConfig;
    
    // Build few-shot examples
    const examplesText = contextAnalysisPrompt.fewShotExamples
      .map(example => `Input: ${example.input}\nOutput: ${JSON.stringify(example.output)}`)
      .join('\n\n');

    // Build main prompt
    const systemMessage = contextAnalysisPrompt.systemMessage;
    const template = contextAnalysisPrompt.template
      .replace('{message}', message)
      .replace('{previousContext}', previousContext ? JSON.stringify(previousContext) : 'none');

    const availableEmotionsText = contextAnalysisPrompt.availableEmotions.join(', ');
    const availableContextsText = contextAnalysisPrompt.availableContexts.join(', ');

    return `${systemMessage}

AVAILABLE EMOTIONS: ${availableEmotionsText}
AVAILABLE CONTEXTS: ${availableContextsText}

EXAMPLES:
${examplesText}

ANALYSIS REQUEST:
${template}

Important: Respond ONLY with valid JSON, no additional text or formatting.`;
  }

  /**
   * Parse structured JSON response from LLM
   */
  private parseStructuredResponse(
    responseText: string, 
    languageConfig: LanguageConfig
  ): Omit<LLMAnalysisResponse, 'processingTime' | 'fallbackUsed'> {
    try {
      // Clean response (remove markdown formatting if present)
      const cleanResponse = responseText.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleanResponse);

      // Validate and normalize response
      return {
        emotion: this.normalizeEmotion(parsed.emotion),
        intensity: this.normalizeIntensity(parsed.intensity),
        context: this.normalizeContext(parsed.context),
        relationshipTone: parsed.relationshipTone || 'casual',
        keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
        culturalContext: parsed.culturalContext || 'general',
        confidence: this.normalizeConfidence(parsed.confidence)
      };

    } catch (error) {
      this.logger.error(`Failed to parse LLM response: ${error.message}`);
      throw new Error('Invalid LLM response format');
    }
  }

  /**
   * Perform fallback analysis using config-based analyzer
   */
  private async performFallbackAnalysis(
    request: LLMAnalysisRequest, 
    processingTime: number
  ): Promise<LLMAnalysisResponse> {
    const { message, language } = request;
    
    // Use existing context analyzer as fallback
    const fallbackResult = this.fallbackAnalyzer.analyzeMessage(message);
    const languageConfig = this.configLoader.getLanguageConfig(language);

    // Enhanced fallback with Vietnamese keyword detection
    const enhancedResult = this.enhanceWithVietnameseKeywords(message, languageConfig, fallbackResult);

    return {
      emotion: enhancedResult.suggestedEmotion,
      intensity: enhancedResult.suggestedIntensity,
      context: enhancedResult.detectedContext,
      relationshipTone: enhancedResult.conversationContext.relationshipTone,
      keywords: enhancedResult.keywords,
      culturalContext: this.detectCulturalContext(message, languageConfig),
      confidence: 0.6, // Lower confidence for fallback
      processingTime,
      fallbackUsed: true
    };
  }

  /**
   * Enhance fallback analysis with Vietnamese keyword detection
   */
  private enhanceWithVietnameseKeywords(
    message: string,
    languageConfig: LanguageConfig,
    fallbackResult: ContextAnalysisResult
  ): ContextAnalysisResult & { suggestedEmotion: EmotionType } {
    const normalizedMessage = message.toLowerCase();
    const detectedKeywords: string[] = [];
    let suggestedEmotion = EmotionType.HAPPY; // default
    let maxScore = 0;

    // Analyze against Vietnamese emotion keywords
    Object.entries(languageConfig.emotionKeywords).forEach(([emotion, keywords]) => {
      let score = 0;
      const emotionKeywords: string[] = [];

      // Check all keyword categories
      ['primary', 'slang', 'expressions', 'terms', 'actions'].forEach(category => {
        if (keywords[category]) {
          keywords[category].forEach((keyword: string) => {
            if (normalizedMessage.includes(keyword.toLowerCase())) {
              score += category === 'primary' ? 3 : 2;
              emotionKeywords.push(keyword);
            }
          });
        }
      });

      if (score > maxScore) {
        maxScore = score;
        suggestedEmotion = emotion as EmotionType;
        detectedKeywords.push(...emotionKeywords);
      }
    });

    // Calculate intensity based on intensifiers
    let intensity = fallbackResult.suggestedIntensity;
    const intensifiers = languageConfig.intensityModifiers.amplifiers;
    
    Object.entries(intensifiers).forEach(([level, words]) => {
      words.forEach(word => {
        if (normalizedMessage.includes(word.toLowerCase())) {
          intensity += level === 'high' ? 0.3 : level === 'medium' ? 0.2 : 0.1;
        }
      });
    });

    intensity = Math.min(1.0, Math.max(0.1, intensity));

    return {
      ...fallbackResult,
      suggestedEmotion,
      suggestedIntensity: intensity,
      keywords: [...new Set([...fallbackResult.keywords, ...detectedKeywords])]
    };
  }

  /**
   * Detect cultural context from message
   */
  private detectCulturalContext(message: string, languageConfig: LanguageConfig): string {
    const normalizedMessage = message.toLowerCase();
    const { relationshipStages } = languageConfig.culturalNuances;

    // Check for relationship terms
    for (const [stage, config] of Object.entries(relationshipStages)) {
      if (config.terms && config.terms.some((term: string) => 
        normalizedMessage.includes(term.toLowerCase())
      )) {
        return `${stage}_communication`;
      }
    }

    // Check for formality level
    const formalWords = ['thưa', 'kính', 'dạ', 'ạ'];
    const casualWords = ['mình', 'tao', 'may', 'bro'];
    
    if (formalWords.some(word => normalizedMessage.includes(word))) {
      return 'formal_context';
    }
    
    if (casualWords.some(word => normalizedMessage.includes(word))) {
      return 'casual_context';
    }

    return 'general_context';
  }

  /**
   * Generate cache key for request
   */
  private generateCacheKey(request: LLMAnalysisRequest): string {
    return `${request.language}:${request.message.toLowerCase().trim()}`;
  }

  /**
   * Clean up cache to prevent memory leaks
   */
  private cleanupCache(): void {
    if (this.cache.size > 1000) {
      const keysToDelete = Array.from(this.cache.keys()).slice(0, 500);
      keysToDelete.forEach(key => this.cache.delete(key));
      this.logger.debug(`Cache cleaned up, removed ${keysToDelete.length} entries`);
    }
  }

  /**
   * Create timeout promise for API calls
   */
  private createTimeoutPromise(timeoutMs: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error('LLM analysis timeout')), timeoutMs);
    });
  }

  /**
   * Normalize emotion to valid EmotionType
   */
  private normalizeEmotion(emotion: string): EmotionType {
    const normalizedEmotion = emotion?.toLowerCase();
    
    // Map to valid EmotionType values
    const emotionMap: Record<string, EmotionType> = {
      'happy': EmotionType.HAPPY,
      'sad': EmotionType.SAD,
      'excited': EmotionType.EXCITED,
      'surprised': EmotionType.SURPRISED,
      'frustrated': EmotionType.FRUSTRATED,
      'confused': EmotionType.CONFUSED,
      'romantic': EmotionType.ROMANTIC,
      'caring': EmotionType.CARING,
      'playful': EmotionType.PLAYFUL,
      'mischievous': EmotionType.MISCHIEVOUS,
      'shy': EmotionType.SHY,
      'confident': EmotionType.CONFIDENT,
      'thoughtful': EmotionType.THOUGHTFUL,
      'curious': EmotionType.CURIOUS,
      'serious': EmotionType.SERIOUS
    };

    return emotionMap[normalizedEmotion] || EmotionType.HAPPY;
  }

  /**
   * Normalize intensity to valid range
   */
  private normalizeIntensity(intensity: any): number {
    const parsed = typeof intensity === 'number' ? intensity : parseFloat(intensity);
    return isNaN(parsed) ? 0.5 : Math.max(0.1, Math.min(1.0, parsed));
  }

  /**
   * Normalize context to valid ContextType
   */
  private normalizeContext(context: string): ContextType {
    const normalizedContext = context?.toLowerCase();
    
    const contextMap: Record<string, ContextType> = {
      'greeting': ContextType.GREETING,
      'goodbye': ContextType.GOODBYE,
      'question': ContextType.QUESTION,
      'compliment': ContextType.COMPLIMENT,
      'flirting': ContextType.FLIRTING,
      'comfort': ContextType.COMFORT,
      'casual': ContextType.CASUAL,
      'story': ContextType.STORY,
      'problem': ContextType.COMFORT
    };

    return contextMap[normalizedContext] || ContextType.CASUAL;
  }

  /**
   * Normalize confidence to valid range
   */
  private normalizeConfidence(confidence: any): number {
    const parsed = typeof confidence === 'number' ? confidence : parseFloat(confidence);
    return isNaN(parsed) ? 0.7 : Math.max(0.0, Math.min(1.0, parsed));
  }
}