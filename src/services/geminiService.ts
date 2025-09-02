import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_CONFIG, ENV_KEYS } from '../utils/constants';
import type { GeminiConfig } from '../types';

class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private config: GeminiConfig;

  constructor() {
    const apiKey = import.meta.env[ENV_KEYS.GEMINI_API_KEY];
    
    this.config = {
      apiKey: apiKey || '',
      model: GEMINI_CONFIG.model,
      temperature: GEMINI_CONFIG.temperature,
      maxTokens: GEMINI_CONFIG.maxTokens
    };

    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  async generateResponse(message: string, conversationHistory: string[] = []): Promise<string> {
    if (!this.genAI) {
      throw new Error('Gemini API key not configured. Please check your environment variables.');
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: this.config.model });
      
      const result = await model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [{
              text: this.buildPrompt(message, conversationHistory)
            }]
          }
        ],
        generationConfig: {
          temperature: this.config.temperature,
          maxOutputTokens: this.config.maxTokens,
        }
      });

      const response = await result.response;
      return response.text() || 'I apologize, but I could not generate a response.';
    } catch (error) {
      console.error('Gemini API error:', error);
      if (error instanceof Error) {
        throw new Error(`AI service error: ${error.message}`);
      }
      throw new Error('Failed to get AI response. Please try again.');
    }
  }

  private buildPrompt(message: string, history: string[]): string {
    const systemPrompt = `You are a helpful AI assistant avatar. You should respond in a conversational, friendly manner. Keep responses concise and engaging, suitable for spoken dialogue. You are embodied as a 3D avatar, so feel free to reference gestures or expressions when appropriate.`;
    
    let prompt = systemPrompt + '\n\n';
    
    if (history.length > 0) {
      prompt += 'Recent conversation:\n';
      history.slice(-6).forEach((msg, index) => {
        const role = index % 2 === 0 ? 'Human' : 'Assistant';
        prompt += `${role}: ${msg}\n`;
      });
      prompt += '\n';
    }
    
    prompt += `Human: ${message}\nAssistant:`;
    
    return prompt;
  }

  isConfigured(): boolean {
    return !!this.genAI;
  }

  getConfig(): GeminiConfig {
    return { ...this.config };
  }
}

export const geminiService = new GeminiService();
