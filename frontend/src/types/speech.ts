// Speech-to-text related types

export interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

export interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

export interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

export interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

export interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

export type SpeechMode = 'push-to-talk' | 'continuous';

export interface SpeechConfig {
  mode: SpeechMode;
  language: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  confidenceThreshold: number;
  autoSend: boolean;
}

export interface SpeechState {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  interimTranscript: string;
  confidence: number;
  error: string | null;
  mode: SpeechMode;
}

export interface SpeechControls {
  startListening: () => void;
  stopListening: () => void;
  toggleMode: () => void;
  clearTranscript: () => void;
  setMode: (mode: SpeechMode) => void;
}

export interface UseSpeechToTextOptions {
  mode?: SpeechMode;
  language?: string;
  confidenceThreshold?: number;
  autoSend?: boolean;
  onTranscriptComplete?: (transcript: string) => void;
  onError?: (error: string) => void;
}

export interface UseSpeechToTextResult {
  state: SpeechState;
  controls: SpeechControls;
}