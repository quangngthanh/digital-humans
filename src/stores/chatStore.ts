import { create } from 'zustand';
import { ChatMessage } from '../types';
import { CHAT_CONFIG } from '../utils/constants';

interface ChatStore {
  messages: ChatMessage[];
  isProcessing: boolean;
  error: string | null;
  
  // Actions
  addMessage: (content: string, role: 'user' | 'assistant') => void;
  setProcessing: (processing: boolean) => void;
  setError: (error: string | null) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  isProcessing: false,
  error: null,

  addMessage: (content: string, role: 'user' | 'assistant') => 
    set((state) => {
      const newMessages = [
        ...state.messages,
        {
          id: Date.now().toString(),
          content,
          role,
          timestamp: new Date()
        }
      ];
      
      // Limit messages to prevent memory issues
      if (newMessages.length > CHAT_CONFIG.maxMessages) {
        newMessages.splice(0, newMessages.length - CHAT_CONFIG.maxMessages);
      }
      
      return { messages: newMessages };
    }),

  setProcessing: (processing: boolean) => 
    set({ isProcessing: processing }),

  setError: (error: string | null) => 
    set({ error }),

  clearMessages: () => 
    set({ messages: [], error: null })
}));
