// Speech-to-text utility functions

import type { SpeechConfig } from '@/types/speech';

/**
 * Check if Speech Recognition API is supported in current browser
 */
export const isSpeechRecognitionSupported = (): boolean => {
  if (typeof window !== 'undefined') {
    const win = window as any;
    return 'webkitSpeechRecognition' in win || 'SpeechRecognition' in win;
  }
  return false;
};

/**
 * Get SpeechRecognition constructor
 */
export const getSpeechRecognition = (): any => {
  if (typeof window !== 'undefined') {
    const win = window as any;
    if ('webkitSpeechRecognition' in win) {
      return win.webkitSpeechRecognition;
    }
    if ('SpeechRecognition' in win) {
      return win.SpeechRecognition;
    }
  }
  return null;
};

/**
 * Default speech configuration
 */
export const defaultSpeechConfig: SpeechConfig = {
  mode: 'push-to-talk',
  language: 'vi-VN',
  continuous: false,
  interimResults: true,
  maxAlternatives: 1,
  confidenceThreshold: 0.7,
  autoSend: true,
};

/**
 * Get speech config for specific mode
 */
export const getSpeechConfigForMode = (mode: 'push-to-talk' | 'continuous'): Partial<SpeechConfig> => {
  switch (mode) {
    case 'push-to-talk':
      return {
        continuous: false,
        interimResults: true,
      };
    case 'continuous':
      return {
        continuous: true,
        interimResults: true,
      };
    default:
      return {};
  }
};

/**
 * Clean up transcript text
 */
export const cleanTranscript = (text: string): string => {
  return text
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/^\w/, (c) => c.toUpperCase()); // Capitalize first letter
};

/**
 * Validate transcript confidence and length
 */
export const isValidTranscript = (
  transcript: string,
  confidence: number,
  threshold: number = 0.7
): boolean => {
  return (
    transcript.trim().length > 0 &&
    confidence >= threshold
  );
};

/**
 * Format speech error message for user display
 */
export const formatSpeechError = (error: string): string => {
  const errorMessages: Record<string, string> = {
    'no-speech': 'Không phát hiện giọng nói. Vui lòng thử lại.',
    'audio-capture': 'Không thể truy cập microphone. Vui lòng kiểm tra quyền truy cập.',
    'not-allowed': 'Quyền truy cập microphone bị từ chối.',
    'network': 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.',
    'aborted': 'Quá trình nhận diện bị hủy.',
    'bad-grammar': 'Lỗi cấu hình nhận diện giọng nói.',
    'language-not-supported': 'Ngôn ngữ không được hỗ trợ.',
  };

  return errorMessages[error] || `Lỗi nhận diện giọng nói: ${error}`;
};

/**
 * Debounce function for speech processing
 */
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};