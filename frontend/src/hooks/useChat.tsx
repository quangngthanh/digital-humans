import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { MessageResponse, ChatContextType } from "@/types";

const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:3007";

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider = ({ children }: ChatProviderProps) => {
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [message, setMessage] = useState<MessageResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [cameraZoomed, setCameraZoomed] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const chat = async (inputMessage: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${backendUrl}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: inputMessage }),
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      const newMessages: MessageResponse[] = data.messages;
      
      setMessages((prevMessages) => [...prevMessages, ...newMessages]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Chat error:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = (): void => {
    setMessages([]);
    setMessage(null);
    setError(null);
  };

  const onMessagePlayed = (): void => {
    setMessages((prevMessages) => prevMessages.slice(1));
  };

  useEffect(() => {
    if (messages.length > 0) {
      setMessage(messages[0]);
    } else {
      setMessage(null);
    }
  }, [messages]);

  const contextValue: ChatContextType = {
    messages,
    isLoading: loading,
    error,
    sendMessage: chat,
    clearMessages,
  };

  // Additional context for UI components
  const extendedContextValue = {
    ...contextValue,
    message,
    onMessagePlayed,
    loading,
    cameraZoomed,
    setCameraZoomed,
  };

  return (
    <ChatContext.Provider value={extendedContextValue as any}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
