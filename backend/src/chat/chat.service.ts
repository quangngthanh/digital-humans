import { Injectable, Logger } from '@nestjs/common';
import { AiService, AiMessage } from '../ai/ai.service';
import { TtsService } from '../tts/tts.service';
import { LipsyncService } from '../lipsync/lipsync.service';
import { MessageDto } from './dto/chat-response.dto';
import * as path from 'path';
import * as fs from 'fs/promises';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly aiService: AiService,
    private readonly ttsService: TtsService,
    private readonly lipsyncService: LipsyncService,
  ) {}

  async processMessage(userMessage?: string): Promise<MessageDto[]> {
    // Handle empty message with predefined responses
    if (!userMessage?.trim()) {
      return this.getDefaultMessages();
    }

    try {
      this.logger.debug(`Processing user message: ${userMessage.substring(0, 50)}...`);

      // Step 1: Generate AI response
      const aiMessages = await this.aiService.generateResponse(userMessage);
      
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

      // Generate audio
      const audioFilePath = await this.ttsService.textToSpeech(
        message.text,
        fileName
      );

      // Generate lipsync
      const lipsyncData = await this.lipsyncService.generateLipsync(audioFilePath);

      // Convert audio to base64
      const audioBase64 = await this.lipsyncService.audioFileToBase64(audioFilePath);

      return {
        text: message.text,
        facialExpression: message.facialExpression,
        animation: message.animation,
        audio: audioBase64,
        lipsync: lipsyncData,
      };

    } catch (error) {
      this.logger.error(`Failed to process message ${index}: ${error.message}`, error.stack);
      
      // Return message without audio/lipsync on error
      return {
        text: message.text,
        facialExpression: message.facialExpression,
        animation: message.animation,
      };
    }
  }

  private async getDefaultMessages(): Promise<MessageDto[]> {
    try {
      // Try to use existing intro audio files if they exist
      const introMessages = [
        {
          text: "Hey dear... How was your day?",
          facialExpression: "smile" as const,
          animation: "Talking_1" as const,
          audioFile: "intro_0.wav",
          lipsyncFile: "intro_0.json",
        },
        {
          text: "I missed you so much... Please don't go for so long!",
          facialExpression: "sad" as const,
          animation: "Crying" as const,
          audioFile: "intro_1.wav",
          lipsyncFile: "intro_1.json",
        },
      ];

      return Promise.all(
        introMessages.map(async (msg) => {
          try {
            const audioBase64 = await this.lipsyncService.audioFileToBase64(
              path.join('audios', msg.audioFile)
            );
            const lipsyncData = JSON.parse(
              await fs.readFile(path.join('audios', msg.lipsyncFile), 'utf8')
            );

            return {
              text: msg.text,
              facialExpression: msg.facialExpression,
              animation: msg.animation,
              audio: audioBase64,
              lipsync: lipsyncData,
            };
          } catch (error) {
            // Return without audio/lipsync if files don't exist
            return {
              text: msg.text,
              facialExpression: msg.facialExpression,
              animation: msg.animation,
            };
          }
        })
      );

    } catch (error) {
      // Fallback to simple text messages
      return [
        {
          text: "Hey dear... How was your day?",
          facialExpression: "smile",
          animation: "Talking_1",
        },
      ];
    }
  }

  private async getErrorMessages(): Promise<MessageDto[]> {
    return [
      {
        text: "Oh no! Something went wrong on my end. Can you try again?",
        facialExpression: "sad",
        animation: "Crying",
      },
    ];
  }
}
