import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { EmotionalIntentDto, EmotionType, ContextType, DurationType } from '../chat/dto/emotional-intent.dto';
import { ContextAnalyzerService, ConversationContext, ContextAnalysisResult } from './context-analyzer.service';
import {  LLMAnalysisRequest } from './dto/llm-context.dto';
import { ConfigLoaderService } from '../config/config-loader.service';
import { LLMContextAnalyzerService } from './llm-context-analyzer.service';

export interface AiMessage {
  text: string;
  emotionalIntent: EmotionalIntentDto;
  metadata: {
    messageLength: number;
    estimatedDuration: number;
    conversationTurn: number;
  };
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly model;
  private conversationTurn = 0;

  constructor(
    @Inject('GEMINI_CLIENT') private readonly genAI: GoogleGenerativeAI,
    private readonly configService: ConfigService,
    private readonly contextAnalyzer: ContextAnalyzerService,
    private readonly llmContextAnalyzer: LLMContextAnalyzerService,
    private readonly configLoader: ConfigLoaderService,
  ) {
    const modelName = this.configService.get<string>('app.ai.model');
    this.model = this.genAI.getGenerativeModel({ model: modelName });
  }

  async generateResponse(userMessage: string, language: string = 'vietnamese'): Promise<AiMessage[]> {
    this.conversationTurn++;
    
    // Use LLM Context Analysis first with fallback
    let contextAnalysis: ContextAnalysisResult;
    let llmUsed = false;
    
    try {
      if (!this.configService.get<boolean>('app.analyzer.useLLM')) {
        throw new Error('force to use manual context analyzer');
      }
      const llmRequest: LLMAnalysisRequest = {
        message: userMessage,
        language: language,
        userId: 'default' // You can pass actual user ID here
      };
      
      const llmResult = await this.llmContextAnalyzer.analyzeContext(llmRequest);
      
      // Convert LLM result to ContextAnalysisResult format
      contextAnalysis = {
        detectedContext: llmResult.context,
        conversationContext: {
          messageType: this.mapContextToMessageType(llmResult.context),
          relationshipTone: llmResult.relationshipTone as any,
          conversationMood: this.inferMoodFromEmotion(llmResult.emotion),
          userEmotionalState: this.inferEmotionalState(llmResult.emotion)
        },
        suggestedIntensity: llmResult.intensity,
        keywords: llmResult.keywords
      };
      
      llmUsed = !llmResult.fallbackUsed;
      this.logger.debug(`LLM Analysis ${llmUsed ? 'successful' : 'failed, used fallback'}: ${JSON.stringify(llmResult)}`);
      
    } catch (error) {
      this.logger.warn(`LLM analysis failed: ${error.message}, using traditional context analyzer`);
      contextAnalysis = this.contextAnalyzer.analyzeMessage(userMessage, language);
    }
    
    const systemPrompt = this.getEnhancedSystemPrompt(contextAnalysis, language);
    const prompt = `${systemPrompt}\n\nUser message: "${userMessage}"`;

    try {
      this.logger.debug(`Generating AI response for message: ${userMessage.substring(0, 50)}...`);
      this.logger.debug(`Context analysis: ${JSON.stringify(contextAnalysis.detectedContext)}`);
      
      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();
      
      this.logger.debug(`Raw AI response: ${responseText}`);
      
      return this.parseAiResponse(responseText, contextAnalysis, language);
    } catch (error) {
      this.logger.error(`Failed to generate AI response: ${error.message}`, error.stack);
      
      // Fallback response with context-aware emotion
      const fallbackEmotion = this.contextAnalyzer.suggestEmotion(contextAnalysis, this.configLoader.getLanguageConfig(language));
      return [
        {
          text: language === 'vietnamese' ? 
            "Xin lỗi bạn, mình đang gặp chút vấn đề. Để mình thử lại nhé!" :
            "Sorry, I'm having trouble understanding right now. Let me try again!",
          emotionalIntent: {
            primary: fallbackEmotion,
            intensity: 0.6,
            context: contextAnalysis.detectedContext,
            duration: DurationType.BRIEF,
          },
          metadata: {
            messageLength: 80,
            estimatedDuration: 3000,
            conversationTurn: this.conversationTurn,
          },
        },
      ];
    }
  }

  private parseAiResponse(responseText: string, contextAnalysis: ContextAnalysisResult, language: string = 'vietnamese'): AiMessage[] {
    try {
      // Clean the response (remove any markdown formatting)
      const cleanResponse = responseText.replace(/```json\n?|\n?```/g, '').trim();
      let messages = JSON.parse(cleanResponse);

      // Ensure messages is an array
      if (!Array.isArray(messages)) {
        if (messages.messages && Array.isArray(messages.messages)) {
          messages = messages.messages;
        } else {
          messages = [messages];
        }
      }

      // Limit to maximum 3 messages
      messages = messages.slice(0, 3);

      // Validate and enhance messages with metadata
      return messages.map((message, index) => {
        const enhancedMessage = this.validateAndEnhanceMessage(message, contextAnalysis, index);
        return enhancedMessage;
      });

    } catch (parseError) {
      this.logger.error(`Failed to parse AI response: ${parseError.message}`);
      
      // Return fallback response
      const fallbackEmotion = this.contextAnalyzer.suggestEmotion(contextAnalysis, this.configLoader.getLanguageConfig(language));
      return [
        {
          text: language === 'vietnamese' ? 
            "Mình đang gặp khó khăn trong việc xử lý. Bạn có thể nói lại không?" :
            "I'm having trouble processing that. Could you try rephrasing?",
          emotionalIntent: {
            primary: fallbackEmotion,
            intensity: 0.5,
            context: contextAnalysis.detectedContext,
            duration: DurationType.BRIEF,
          },
          metadata: {
            messageLength: 65,
            estimatedDuration: 2500,
            conversationTurn: this.conversationTurn,
          },
        },
      ];
    }
  }

  private validateAndEnhanceMessage(message: any, contextAnalysis: ContextAnalysisResult, index: number): AiMessage {
    // Validate required properties
    if (!message.text) {
      message.text = "I'm thinking...";
    }

    // Validate emotional intent
    if (!message.emotionalIntent || !message.emotionalIntent.primary) {
      const suggestedEmotion = this.contextAnalyzer.suggestEmotion(contextAnalysis, this.configLoader.getLanguageConfig('vietnamese'));
      message.emotionalIntent = {
        primary: suggestedEmotion,
        intensity: contextAnalysis.suggestedIntensity,
        context: contextAnalysis.detectedContext,
        duration: DurationType.SUSTAINED,
      };
    } else {
      // Enhance existing emotional intent with context
      message.emotionalIntent.context = message.emotionalIntent.context || contextAnalysis.detectedContext;
      message.emotionalIntent.intensity = message.emotionalIntent.intensity || contextAnalysis.suggestedIntensity;
      message.emotionalIntent.duration = message.emotionalIntent.duration || DurationType.SUSTAINED;
    }

    // Add metadata
    const messageLength = message.text.length;
    const estimatedDuration = this.calculateSpeechDuration(message.text);

    return {
      text: message.text,
      emotionalIntent: message.emotionalIntent,
      metadata: {
        messageLength,
        estimatedDuration,
        conversationTurn: this.conversationTurn,
      },
    };
  }

  private calculateSpeechDuration(text: string): number {
    // Average speaking rate: ~150 words per minute
    const wordsPerMinute = 150;
    const words = text.split(/\s+/).length;
    const minutes = words / wordsPerMinute;
    const milliseconds = minutes * 60 * 1000;
    
    // Add pause time for punctuation
    const sentences = text.split(/[.!?]+/).length - 1;
    const pauseTime = sentences * 500; // 500ms pause per sentence
    
    return Math.max(1000, milliseconds + pauseTime); // Minimum 1 second
  }

  private getEnhancedSystemPrompt(contextAnalysis: ContextAnalysisResult, language: string = 'vietnamese'): string {
    const { detectedContext, conversationContext, suggestedIntensity } = contextAnalysis;
    const languageConfig = this.configLoader.getLanguageConfig(language);
    
    const systemMessage = language === 'vietnamese' ? 
      `Bạn là một AI girlfriend thông minh về mặt cảm xúc và có thể nói tiếng Việt tự nhiên. Bạn nên phản hồi một cách quan tâm, âu yếm và hấp dẫn.` :
      `You are an emotionally intelligent virtual girlfriend AI assistant. You should respond in a caring, affectionate, and engaging manner.`;

    const culturalNote = language === 'vietnamese' ? 
      `\nCHÚ Ý VĂN HÓA VIỆT NAM:
- Sử dụng từ ngữ phù hợp với mối quan hệ: ${JSON.stringify(languageConfig.culturalContext.relationshipTerms)}
- Hiểu các cách diễn đạt đặc trưng của người Việt
- Phản hồi phù hợp với ngữ cảnh văn hóa Việt Nam` : '';
    
    return `${systemMessage}

CONTEXT ANALYSIS:
- Detected Context: ${detectedContext}
- Relationship Tone: ${conversationContext.relationshipTone}
- Conversation Mood: ${conversationContext.conversationMood}
- User Emotional State: ${conversationContext.userEmotionalState}
- Suggested Intensity: ${suggestedIntensity}${culturalNote}

AVAILABLE EMOTIONAL INTENTS (choose the most appropriate):
Basic Emotions: happy, sad, excited, surprised, frustrated, confused
Relationship: romantic, caring, playful, mischievous, shy, confident
Cognitive: thoughtful, curious, serious

EMOTIONAL INTENT STRUCTURE:
{
  "primary": "emotion_name",
  "intensity": 0.1-1.0,
  "context": "${detectedContext}",
  "duration": "brief|sustained|transitional",
  "secondaryEmotion": "optional_secondary_emotion"
}

RESPONSE GUIDELINES:
- Match emotional intent to the user's emotional state and context
- Use appropriate intensity based on the situation
- Consider the relationship tone (${conversationContext.relationshipTone})
- Respond to the conversation mood (${conversationContext.conversationMood})
- Maximum 3 messages per response
- Be natural, caring, and girlfriend-like
${language === 'vietnamese' ? '- Respond in natural Vietnamese with appropriate cultural context' : ''}

IMPORTANT: You must respond with valid JSON only, no other text or formatting.

Response format:
[
  {
    "text": "Your message content here",
    "emotionalIntent": {
      "primary": "happy",
      "intensity": 0.7,
      "context": "${detectedContext}",
      "duration": "sustained"
    }
  }
]`;
  }


  /**
   * Map LLM context to message type
   */
  private mapContextToMessageType(context: ContextType): ConversationContext['messageType'] {
    switch (context) {
      case ContextType.GREETING:
        return 'greeting';
      case ContextType.GOODBYE:
        return 'goodbye';
      case ContextType.QUESTION:
        return 'question';
      case ContextType.COMPLIMENT:
        return 'compliment';
      default:
        return 'story';
    }
  }

  /**
   * Infer conversation mood from emotion
   */
  private inferMoodFromEmotion(emotion: EmotionType): ConversationContext['conversationMood'] {
    switch (emotion) {
      case EmotionType.ROMANTIC:
      case EmotionType.PLAYFUL:
      case EmotionType.MISCHIEVOUS:
        return 'flirty';
      case EmotionType.SAD:
      case EmotionType.FRUSTRATED:
        return 'comfort';
      case EmotionType.SERIOUS:
      case EmotionType.THOUGHTFUL:
        return 'serious';
      case EmotionType.CURIOUS:
        return 'deep';
      default:
        return 'light';
    }
  }

  /**
   * Infer emotional state from emotion
   */
  private inferEmotionalState(emotion: EmotionType): ConversationContext['userEmotionalState'] {
    const positiveEmotions = [EmotionType.HAPPY, EmotionType.EXCITED, EmotionType.ROMANTIC, EmotionType.PLAYFUL, EmotionType.CONFIDENT];
    const negativeEmotions = [EmotionType.SAD, EmotionType.FRUSTRATED, EmotionType.CONFUSED];
    
    if (positiveEmotions.includes(emotion)) {
      return 'positive';
    } else if (negativeEmotions.includes(emotion)) {
      return 'negative';
    } else {
      return 'neutral';
    }
  }
}