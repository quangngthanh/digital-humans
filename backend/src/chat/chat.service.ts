import { Injectable, Logger } from '@nestjs/common';
import { AiService, AiMessage } from '../ai/ai.service';
import { TtsService } from '../tts/tts.service';
import { LipsyncService } from '../lipsync/lipsync.service';
import { MessageDto } from './dto/chat-response.dto';
import { EmotionType, ContextType, DurationType } from './dto/emotional-intent.dto';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly aiService: AiService,
    private readonly ttsService: TtsService,
    private readonly lipsyncService: LipsyncService,
  ) {}

  async processMessage(userMessage?: string, language: string = 'vietnamese'): Promise<MessageDto[]> {

    try {
      this.logger.debug(`Processing user message: ${userMessage.substring(0, 50)}... (language: ${language})`);

      // Step 1: Generate AI response with language support
      const aiMessages = await this.aiService.generateResponse(userMessage, language);

      // Step 2: Generate audio and lipsync for each message
      const processedMessages = await Promise.all(
        aiMessages.map((message, index) => this.processAiMessage(message, index))
      );

      this.logger.debug(`Successfully processed ${processedMessages.length} messages`);
      return processedMessages;

    } catch (error) {
      this.logger.error(`Chat processing failed: ${error.message}`, error.stack);
      return this.getErrorMessages();
    }
  }

  private async processAiMessage(message: AiMessage, index: number): Promise<MessageDto> {
    const fileName = `message_${index}.mp3`;
    
    try {
      this.logger.debug(`Processing message ${index}: "${message.text.substring(0, 50)}..."`);
      this.logger.debug(`Emotional intent: ${JSON.stringify(message.emotionalIntent)}`);

      // Generate audio
      const audioFilePath = await this.ttsService.textToSpeech(
        message.text,
        fileName
      );

      // Generate lipsync
      const lipsyncData = await this.lipsyncService.generateLipsync(audioFilePath, message.text);

      // Convert audio to base64
      const audioBase64 = await this.lipsyncService.audioFileToBase64(audioFilePath);

      return {
        text: message.text,
        emotionalIntent: message.emotionalIntent,
        // metadata: message.metadata,
        audio: audioBase64,
        lipsync: lipsyncData,
      };

    } catch (error) {
      this.logger.error(`Failed to process message ${index}: ${error.message}`, error.stack);
      
      // Return message without audio/lipsync on error
      return {
        text: message.text,
        emotionalIntent: message.emotionalIntent,
        // metadata: message.metadata,
      };
    }
  }

  

  private async getErrorMessages(): Promise<MessageDto[]> {
    return [
      {
        text: "Ôi, Hiện tại có lỗi nào đó xảy ra. Bạn có thể nói lại không?",
        emotionalIntent: {
          primary: EmotionType.CONFUSED,
          intensity: 0.6,
          context: ContextType.CASUAL,
          duration: DurationType.BRIEF,
        },
        /* metadata: {
          messageLength: 60,
          estimatedDuration: 2500,
          conversationTurn: 0,
        }, */
      },
    ];
  }
}
