// Chat related types
export interface ChatMessageRequest {
  message: string;
}

export interface EmotionalIntent {
  primary: string;
  intensity: number;
  context: string;
  duration?: string;
  secondaryEmotion?: string;
}

export interface MessageMetadata {
  messageLength: number;
  estimatedDuration: number;
  conversationTurn: number;
}

export interface MessageResponse {
  text: string;
  emotionalIntent: EmotionalIntent;
  metadata?: MessageMetadata;
  audio?: string;
  lipsync?: LipSyncData;
}

export interface LipSyncData {
  metadata: {
    soundFile?: string;
    duration: number;
  };
  mouthCues: {
    start: number;
    end: number;
    value: string;
  }[];
}

export interface ChatResponse {
  messages: MessageResponse[];
}

export interface AvatarState {
  expression: string;
  animation: string;
  transitionDuration: number;
  blendingRatio?: number;
}

// Voice related types
export interface TestVoiceRequest {
  voiceId: string;
  text: string;
  model?: string;
}

export interface Voice {
  voice_id: string;
  name: string;
  category: string;
  description?: string;
}

// API Error types
export interface ApiError {
  statusCode: number;
  timestamp: string;
  path: string;
  message: string;
}

// UI Component types
export interface AvatarProps {
  currentMessage?: MessageResponse;
  isLoading?: boolean;
}

export interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export interface VoiceSelectProps {
  voices: Voice[];
  selectedVoiceId: string;
  onVoiceChange: (voiceId: string) => void;
}

// Hook types
export interface ChatContextType {
  messages: MessageResponse[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (message: string) => Promise<void>;
  clearMessages: () => void;
  onMessagePlayed: () => void;
  cameraZoomed: boolean;
  setCameraZoomed: (cameraZoomed: boolean) => void;
}

// Three.js / React Three Fiber types
export interface AvatarModelProps {
  currentAnimation?: string;
  facialExpression?: string;
  lipSyncData?: any;
}

// Audio types
export interface AudioConfig {
  autoPlay: boolean;
  volume: number;
  muted: boolean;
}

// App configuration types
export interface AppConfig {
  apiBaseUrl: string;
  defaultVoiceId: string;
  audioConfig: AudioConfig;
}
