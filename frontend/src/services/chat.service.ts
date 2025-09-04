import apiClient from "../lib/api/apiClient";
import { apiRoutes } from "../routes/route";
import { ChatMessageRequest, ChatResponse, Voice } from "../types";

class ChatService {
  static async getGreeting(): Promise<ChatResponse> {
    return await apiClient.get<ChatResponse>(apiRoutes.base);
  }

  
 static async sendMessage(message: string): Promise<ChatResponse> {
    try {
      const response = await apiClient.post<ChatResponse>(apiRoutes.chat, {
        message,
      } as ChatMessageRequest);
      
      return response;
    } catch (error) {
      throw new Error(error as string);
    }
  }

  // Voice endpoints
 static async getVoices(): Promise<Voice[]> {
    try {
      const response = await apiClient.get<Voice[]>(apiRoutes.voices);
      return response;
    } catch (error) {
      throw new Error(error as string);
    }
  }


}

export const chatService = new ChatService();

export default ChatService;