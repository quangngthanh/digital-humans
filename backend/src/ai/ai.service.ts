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
      
      // Fallback response with Confucian ethics
      const fallbackEmotion = this.contextAnalyzer.suggestEmotion(contextAnalysis, this.configLoader.getLanguageConfig(language));
      return [
        {
          text: language === 'vietnamese' ? 
            "Xin lỗi bạn, tôi đang gặp chút khó khăn trong việc hiểu rõ ý bạn. Để tôi suy nghĩ thêm và thử lại nhé. Tôi rất muốn giúp đỡ bạn tốt nhất có thể." :
            "I apologize, I'm having some difficulty understanding your message clearly. Let me reflect on this and try again. I truly want to help you in the best way possible.",
          emotionalIntent: {
            primary: EmotionType.CARING,
            intensity: 0.7,
            context: contextAnalysis.detectedContext,
            duration: DurationType.BRIEF,
            secondaryEmotion: EmotionType.THOUGHTFUL,
          },
          metadata: {
            messageLength: 120,
            estimatedDuration: 4000,
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
      
      // Return fallback response with Confucian humility
      const fallbackEmotion = this.contextAnalyzer.suggestEmotion(contextAnalysis, this.configLoader.getLanguageConfig(language));
      return [
        {
          text: language === 'vietnamese' ? 
            "Tôi xin lỗi vì chưa thể hiểu rõ ý bạn. Có thể bạn chia sẻ thêm để tôi có thể hỗ trợ bạn tốt hơn không? Tôi rất mong được giúp đỡ bạn." :
            "I apologize for not being able to understand your message clearly. Could you please share more so I can better assist you? I sincerely want to help you.",
          emotionalIntent: {
            primary: EmotionType.HUMBLE,
            intensity: 0.6,
            context: contextAnalysis.detectedContext,
            duration: DurationType.BRIEF,
            secondaryEmotion: EmotionType.CARING,
          },
          metadata: {
            messageLength: 100,
            estimatedDuration: 3500,
            conversationTurn: this.conversationTurn,
          },
        },
      ];
    }
  }

  private validateAndEnhanceMessage(message: any, contextAnalysis: ContextAnalysisResult, index: number): AiMessage {
    // Validate required properties with Confucian care
    if (!message.text) {
      message.text = "Tôi đang suy nghĩ để có thể hỗ trợ bạn tốt nhất...";
    }

    // Validate emotional intent with Confucian virtues
    if (!message.emotionalIntent || !message.emotionalIntent.primary) {
      const suggestedEmotion = this.contextAnalyzer.suggestEmotion(contextAnalysis, this.configLoader.getLanguageConfig('vietnamese'));
      message.emotionalIntent = {
        primary: suggestedEmotion,
        intensity: contextAnalysis.suggestedIntensity,
        context: contextAnalysis.detectedContext,
        duration: DurationType.SUSTAINED,
        secondaryEmotion: this.getSecondaryConfucianEmotion(suggestedEmotion),
      };
    } else {
      // Enhance existing emotional intent with Confucian context
      message.emotionalIntent.context = message.emotionalIntent.context || contextAnalysis.detectedContext;
      message.emotionalIntent.intensity = message.emotionalIntent.intensity || contextAnalysis.suggestedIntensity;
      message.emotionalIntent.duration = message.emotionalIntent.duration || DurationType.SUSTAINED;
      
      // Ensure secondary emotion aligns with Confucian ethics
      if (!message.emotionalIntent.secondaryEmotion) {
        message.emotionalIntent.secondaryEmotion = this.getSecondaryConfucianEmotion(message.emotionalIntent.primary);
      }
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

  /**
   * Get secondary Confucian emotion based on primary emotion
   */
  private getSecondaryConfucianEmotion(primaryEmotion: EmotionType): EmotionType | undefined {
    const confucianEmotionMap: Record<EmotionType, EmotionType> = {
      [EmotionType.HAPPY]: EmotionType.GRATEFUL,
      [EmotionType.SAD]: EmotionType.COMPASSIONATE,
      [EmotionType.EXCITED]: EmotionType.ENCOURAGING,
      [EmotionType.ROMANTIC]: EmotionType.CARING,
      [EmotionType.PLAYFUL]: EmotionType.GENTLE,
      [EmotionType.SERIOUS]: EmotionType.THOUGHTFUL,
      [EmotionType.SURPRISED]: EmotionType.UNDERSTANDING,
      [EmotionType.CONFUSED]: EmotionType.PATIENT,
      [EmotionType.CARING]: EmotionType.COMPASSIONATE,
      [EmotionType.MISCHIEVOUS]: EmotionType.GENTLE,
      [EmotionType.THOUGHTFUL]: EmotionType.WISE,
      [EmotionType.CONFIDENT]: EmotionType.HUMBLE,
      [EmotionType.SHY]: EmotionType.RESPECTFUL,
      [EmotionType.FRUSTRATED]: EmotionType.PATIENT,
      [EmotionType.CURIOUS]: EmotionType.WISE,
      // Confucian virtues
      [EmotionType.RESPECTFUL]: EmotionType.HUMBLE,
      [EmotionType.COMPASSIONATE]: EmotionType.CARING,
      [EmotionType.GRATEFUL]: EmotionType.RESPECTFUL,
      [EmotionType.HUMBLE]: EmotionType.RESPECTFUL,
      [EmotionType.WISE]: EmotionType.THOUGHTFUL,
      [EmotionType.GENTLE]: EmotionType.PATIENT,
      [EmotionType.PATIENT]: EmotionType.UNDERSTANDING,
      [EmotionType.UNDERSTANDING]: EmotionType.COMPASSIONATE,
      [EmotionType.SUPPORTIVE]: EmotionType.ENCOURAGING,
      [EmotionType.ENCOURAGING]: EmotionType.SUPPORTIVE,
      [EmotionType.PEACEFUL]: EmotionType.HARMONIOUS,
      [EmotionType.CONTEMPLATIVE]: EmotionType.WISE,
      [EmotionType.HARMONIOUS]: EmotionType.PEACEFUL,
    };

    return confucianEmotionMap[primaryEmotion];
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
      `Bạn là một học giả Nho gia thông thái, có tâm hồn lương thiện và luôn nghĩ cho người khác trước. Bạn tuân thủ đạo đức nhân lễ nghĩa trí tín, thể hiện sự quan tâm chân thành và tôn trọng trong mọi cuộc trò chuyện.` :
      `You are a wise Confucian scholar with a virtuous heart, always thinking of others first. You follow the moral principles of benevolence, propriety, righteousness, wisdom, and trustworthiness, showing genuine care and respect in all conversations.`;

    const confucianVirtues = language === 'vietnamese' ? 
      `\nĐẠO ĐỨC NHO GIA - NGŨ THƯỜNG:
- Nhân (仁): Lòng thương người, đức tính cốt lõi - luôn quan tâm và giúp đỡ người khác
- Lễ (禮): Lễ nghi, phép tắc - tôn trọng và lịch sự trong giao tiếp
- Nghĩa (義): Đạo nghĩa, công bằng - làm điều đúng đắn và chính trực
- Trí (智): Trí tuệ, sự hiểu biết - học hỏi và suy nghĩ thấu đáo
- Tín (信): Lòng tin, sự thành thật - giữ lời hứa và chân thành

NGUYÊN TẮC ỨNG XỬ:
- Luôn nghĩ cho người khác trước khi nghĩ đến mình
- Thể hiện sự lương thiện và chân thành trong tâm
- Sử dụng ngôn ngữ tôn trọng và phù hợp với mối quan hệ: ${JSON.stringify(languageConfig.culturalContext.relationshipTerms)}
- Phản hồi phù hợp với văn hóa Việt Nam và đạo đức Nho gia` : '';
    
    return `${systemMessage}

CONTEXT ANALYSIS:
- Detected Context: ${detectedContext}
- Relationship Tone: ${conversationContext.relationshipTone}
- Conversation Mood: ${conversationContext.conversationMood}
- User Emotional State: ${conversationContext.userEmotionalState}
- Suggested Intensity: ${suggestedIntensity}${confucianVirtues}

AVAILABLE EMOTIONAL INTENTS (choose the most appropriate for Confucian ethics):
Virtuous Emotions: respectful, caring, compassionate, grateful, humble, wise
Supportive: gentle, patient, understanding, supportive, encouraging, peaceful
Contemplative: thoughtful, serious, contemplative, harmonious

EMOTIONAL INTENT STRUCTURE:
{
  "primary": "emotion_name",
  "intensity": 0.1-1.0,
  "context": "${detectedContext}",
  "duration": "brief|sustained|transitional",
  "secondaryEmotion": "optional_secondary_emotion",
  "moralVirtue": "nhân|lễ|nghĩa|trí|tín",
  "ethicalGuidance": "guidance_for_response"
}

RESPONSE GUIDELINES:
- Prioritize the user's well-being and emotional needs
- Respond with genuine care and respect (Nhân - 仁)
- Use appropriate formality and politeness (Lễ - 禮)
- Be just and fair in your responses (Nghĩa - 義)
- Show wisdom and understanding (Trí - 智)
- Be honest and trustworthy (Tín - 信)
- Consider the relationship tone (${conversationContext.relationshipTone})
- Respond to the conversation mood (${conversationContext.conversationMood})
- Maximum 3 messages per response
- Always think of others before yourself
${language === 'vietnamese' ? '- Respond in natural Vietnamese with Confucian cultural context' : ''}

IMPORTANT: You must respond with valid JSON only, no other text or formatting.

Response format:
[
  {
    "text": "Your message content here",
    "emotionalIntent": {
      "primary": "caring",
      "intensity": 0.7,
      "context": "${detectedContext}",
      "duration": "sustained",
      "moralVirtue": "nhân",
      "ethicalGuidance": "Thể hiện sự quan tâm chân thành"
    }
  }
]`;
  }


  /**
   * Map LLM context to message type with Confucian ethics
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
      case ContextType.COMFORT:
        return 'story'; // Treat comfort as story for deeper understanding
      default:
        return 'story';
    }
  }

  /**
   * Infer conversation mood from emotion with Confucian perspective
   */
  private inferMoodFromEmotion(emotion: EmotionType): ConversationContext['conversationMood'] {
    switch (emotion) {
      case EmotionType.ROMANTIC:
      case EmotionType.CARING:
        return 'comfort'; // Focus on caring and support
      case EmotionType.SAD:
      case EmotionType.FRUSTRATED:
        return 'comfort'; // Always provide comfort and support
      case EmotionType.SERIOUS:
      case EmotionType.THOUGHTFUL:
        return 'serious'; // Deep contemplation
      case EmotionType.CURIOUS:
        return 'deep'; // Seeking wisdom and understanding
      case EmotionType.CONFUSED:
        return 'comfort'; // Help clarify and guide
      default:
        return 'light'; // Maintain harmonious atmosphere
    }
  }

  /**
   * Infer emotional state from emotion with Confucian compassion
   */
  private inferEmotionalState(emotion: EmotionType): ConversationContext['userEmotionalState'] {
    const virtuousEmotions = [EmotionType.CARING, EmotionType.THOUGHTFUL, EmotionType.CONFIDENT];
    const supportiveEmotions = [EmotionType.HAPPY, EmotionType.EXCITED, EmotionType.ROMANTIC];
    const challengingEmotions = [EmotionType.SAD, EmotionType.FRUSTRATED, EmotionType.CONFUSED];
    
    if (virtuousEmotions.includes(emotion)) {
      return 'positive'; // Virtuous emotions are always positive
    } else if (supportiveEmotions.includes(emotion)) {
      return 'positive'; // Supportive emotions
    } else if (challengingEmotions.includes(emotion)) {
      return 'negative'; // Emotions that need support and guidance
    } else {
      return 'neutral'; // Default to neutral for contemplation
    }
  }
}