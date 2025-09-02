// Chat message types
export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

// Avatar types
export interface Avatar {
  id: string;
  name: string;
  url: string;
  thumbnailUrl?: string;
}

// TTS types
export interface TTSConfig {
  voice: string;
  rate: number;
  pitch: number;
  volume: number;
}

// Audio analysis types
export interface AudioData {
  volume: number;
  frequency: number[];
  timestamp: number;
}

// App state types
export interface AppState {
  isLoading: boolean;
  error: string | null;
  currentAvatar: Avatar | null;
  ttsConfig: TTSConfig;
}

// Gemini API types
export interface GeminiConfig {
  apiKey: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
}

export interface GeminiResponse {
  text: string;
  candidates?: any[];
}

// Avatar loading states
export type AvatarState = 'loading' | 'loaded' | 'error';

// Chat configuration types
export interface ChatConfig {
  maxMessages: number;
  typingDelay: number;
  maxResponseLength: number;
}

// Voice control types
export interface VoiceControl {
  isEnabled: boolean;
  isListening: boolean;
  isSpeaking: boolean;
}
