import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface AiMessage {
  text: string;
  facialExpression: 'smile' | 'sad' | 'angry' | 'surprised' | 'funnyFace' | 'default';
  animation: 'Talking_0' | 'Talking_1' | 'Talking_2' | 'Crying' | 'Laughing' | 'Rumba' | 'Idle' | 'Terrified' | 'Angry';
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly model;

  constructor(
    @Inject('GEMINI_CLIENT') private readonly genAI: GoogleGenerativeAI,
    private readonly configService: ConfigService,
  ) {
    const modelName = this.configService.get<string>('app.ai.model');
    this.model = this.genAI.getGenerativeModel({ model: modelName });
  }

  async generateResponse(userMessage: string): Promise<AiMessage[]> {
    const systemPrompt = this.getSystemPrompt();
    const prompt = `${systemPrompt}\n\nUser message: "${userMessage}"`;

    try {
      this.logger.debug(`Generating AI response for message: ${userMessage.substring(0, 50)}...`);
      
      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();
      
      this.logger.debug(`Raw AI response: ${responseText}`);
      
      return this.parseAiResponse(responseText);
    } catch (error) {
      this.logger.error(`Failed to generate AI response: ${error.message}`, error.stack);
      
      // Fallback response
      return [
        {
          text: "Sorry sweetie, I'm having trouble understanding right now. Let me try again!",
          facialExpression: 'sad',
          animation: 'Talking_0',
        },
      ];
    }
  }

  private parseAiResponse(responseText: string): AiMessage[] {
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

      // Validate and sanitize messages
      return messages.map((message, index) => {
        if (!message.text || !message.facialExpression || !message.animation) {
          this.logger.warn(`Message ${index} missing required properties: ${JSON.stringify(message)}`);
          return {
            text: message.text || "I'm thinking...",
            facialExpression: message.facialExpression || 'default',
            animation: message.animation || 'Talking_0',
          };
        }
        return message;
      });

    } catch (parseError) {
      this.logger.error(`Failed to parse AI response: ${parseError.message}`);
      
      // Return fallback response
      return [
        {
          text: "I'm having trouble processing that. Could you try rephrasing?",
          facialExpression: 'default',
          animation: 'Talking_0',
        },
      ];
    }
  }

  private getSystemPrompt(): string {
    return `You are a virtual girlfriend AI assistant. You should respond in a caring, affectionate, and engaging manner.

    IMPORTANT: You must respond with valid JSON only, no other text or formatting.

    Your response must be a JSON array of message objects. Each message should have these properties:
    - text: The message content (string)
    - facialExpression: One of: "smile", "sad", "angry", "surprised", "funnyFace", "default"
    - animation: One of: "Talking_0", "Talking_1", "Talking_2", "Crying", "Laughing", "Rumba", "Idle", "Terrified", "Angry"

    Rules:
    - Maximum 3 messages per response
    - Be natural, caring, and girlfriend-like in your responses
    - Choose appropriate facial expressions and animations that match the message tone
    - Return only valid JSON array format

    Example response format:
    [
      {
        "text": "Hi sweetie! I'm so happy to hear from you!",
        "facialExpression": "smile", 
        "animation": "Talking_1"
      }
    ]`;
  }
}
