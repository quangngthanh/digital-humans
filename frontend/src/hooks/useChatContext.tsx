import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { MessageResponse, ChatContextType, ChatMessageRequest, ChatResponse } from "@/types";
import apiClient from "@/lib/api/apiClient";
import { apiRoutes } from "@/routes/route";

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider = ({ children }: ChatProviderProps) => {
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [cameraZoomed, setCameraZoomed] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (inputMessage: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiClient.post<ChatResponse>(apiRoutes.chat, {
        message: inputMessage,
      } as ChatMessageRequest);
      
      if (!response) {
        throw new Error(`API Error: ${response}`);
      }
      
      const newMessages: MessageResponse[] = response.messages;
      
      setMessages(newMessages);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = (): void => {
    setMessages([]);
    setError(null);
  };

  const onMessagePlayed = (): void => {
    setMessages((prevMessages) => prevMessages.slice(1));
  };


  const contextValue: ChatContextType = {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    onMessagePlayed,
    cameraZoomed,
    setCameraZoomed,
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
