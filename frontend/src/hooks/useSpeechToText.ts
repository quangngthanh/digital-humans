import { useState, useCallback, useRef, useEffect } from 'react';
import type { 
  UseSpeechToTextOptions, 
  UseSpeechToTextResult, 
  SpeechState, 
  SpeechControls, 
  SpeechMode,
  SpeechRecognitionEvent,
  SpeechRecognitionErrorEvent
} from '@/types/speech';
import {
  isSpeechRecognitionSupported,
  getSpeechRecognition,
  defaultSpeechConfig,
  getSpeechConfigForMode,
  cleanTranscript,
  isValidTranscript,
  formatSpeechError,
  debounce
} from '@/utils/speechUtils';

/**
 * Custom hook for Speech-to-Text functionality
 * Supports both push-to-talk and continuous modes
 * Optimized for Vietnamese language with auto-send capability
 */
export const useSpeechToText = (options: UseSpeechToTextOptions = {}): UseSpeechToTextResult => {
  const {
    mode = defaultSpeechConfig.mode,
    language = defaultSpeechConfig.language,
    confidenceThreshold = defaultSpeechConfig.confidenceThreshold,
    autoSend = defaultSpeechConfig.autoSend,
    onTranscriptComplete,
    onError
  } = options;

  // State management
  const [state, setState] = useState<SpeechState>({
    isListening: false,
    isSupported: isSpeechRecognitionSupported(),
    transcript: '',
    interimTranscript: '',
    confidence: 0,
    error: null,
    mode: mode
  });

  // Refs for managing recognition instance and cleanup
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isInitializedRef = useRef(false);
  const finalTranscriptRef = useRef('');

  /**
   * Initialize Speech Recognition instance
   */
  const initializeSpeechRecognition = useCallback(() => {
    if (!state.isSupported || isInitializedRef.current) {
      return null;
    }

    const SpeechRecognitionClass = getSpeechRecognition();
    if (!SpeechRecognitionClass) {
      setState(prev => ({ ...prev, error: 'Trình duyệt không hỗ trợ nhận diện giọng nói' }));
      return null;
    }

    const recognition = new SpeechRecognitionClass();
    const modeConfig = getSpeechConfigForMode(state.mode);

    // Configure recognition
    recognition.lang = language;
    recognition.continuous = modeConfig.continuous || false;
    recognition.interimResults = modeConfig.interimResults || true;
    recognition.maxAlternatives = defaultSpeechConfig.maxAlternatives;

    // Event handlers
    recognition.onstart = () => {
      console.log('🎤 Speech recognition started');
      setState(prev => ({ ...prev, isListening: true, error: null }));
      finalTranscriptRef.current = '';
    };

    recognition.onend = () => {
      console.log('🎤 Speech recognition ended');
      setState(prev => ({ ...prev, isListening: false }));
      
      // Auto-send if we have final transcript
      if (autoSend && finalTranscriptRef.current.trim()) {
        const cleanedTranscript = cleanTranscript(finalTranscriptRef.current);
        onTranscriptComplete?.(cleanedTranscript);
        finalTranscriptRef.current = '';
      }
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      // Process all results
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const alternative = result[0];
        
        if (result.isFinal) {
          // Check confidence threshold for final results
          if (isValidTranscript(alternative.transcript, alternative.confidence, confidenceThreshold)) {
            finalTranscript += alternative.transcript;
            finalTranscriptRef.current += alternative.transcript;
            
            setState(prev => ({
              ...prev,
              transcript: cleanTranscript(finalTranscriptRef.current),
              confidence: alternative.confidence
            }));
          }
        } else {
          interimTranscript += alternative.transcript;
          setState(prev => ({
            ...prev,
            interimTranscript: alternative.transcript
          }));
        }
      }

      // Log for debugging
      if (finalTranscript) {
        console.log('🎤 Final transcript:', finalTranscript);
      }
      if (interimTranscript) {
        console.log('🎤 Interim transcript:', interimTranscript);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const formattedError = formatSpeechError(event.error);
      console.error('🎤 Speech recognition error:', event.error, event.message);
      
      setState(prev => ({
        ...prev,
        error: formattedError,
        isListening: false
      }));
      
      onError?.(formattedError);
    };

    recognitionRef.current = recognition;
    isInitializedRef.current = true;
    
    return recognition;
  }, [state.isSupported, state.mode, language, confidenceThreshold, autoSend, onTranscriptComplete, onError]);

  /**
   * Start listening
   */
  const startListening = useCallback(() => {
    if (!state.isSupported) {
      const error = 'Trình duyệt không hỗ trợ nhận diện giọng nói';
      setState(prev => ({ ...prev, error }));
      onError?.(error);
      return;
    }

    if (state.isListening) {
      console.log('🎤 Already listening, skipping start');
      return;
    }

    const recognition = recognitionRef.current || initializeSpeechRecognition();
    if (!recognition) return;

    try {
      recognition.start();
      console.log('🎤 Starting speech recognition');
    } catch (error) {
      console.error('🎤 Error starting recognition:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Không thể khởi động nhận diện giọng nói',
        isListening: false
      }));
    }
  }, [state.isSupported, state.isListening, initializeSpeechRecognition, onError]);

  /**
   * Stop listening
   */
  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !state.isListening) {
      return;
    }

    try {
      recognitionRef.current.stop();
      console.log('🎤 Stopping speech recognition');
    } catch (error) {
      console.error('🎤 Error stopping recognition:', error);
    }
  }, [state.isListening]);

  /**
   * Clear transcript
   */
  const clearTranscript = useCallback(() => {
    setState(prev => ({
      ...prev,
      transcript: '',
      interimTranscript: '',
      confidence: 0,
      error: null
    }));
    finalTranscriptRef.current = '';
  }, []);

  /**
   * Set mode and reconfigure recognition
   */
  const setMode = useCallback((newMode: SpeechMode) => {
    if (newMode === state.mode) return;

    // Stop current recognition if running
    if (state.isListening) {
      stopListening();
    }

    setState(prev => ({ ...prev, mode: newMode }));
    
    // Reset initialization to force reconfiguration
    isInitializedRef.current = false;
    recognitionRef.current = null;
    
    console.log('🎤 Switched to mode:', newMode);
  }, [state.mode, state.isListening, stopListening]);

  /**
   * Toggle between modes
   */
  const toggleMode = useCallback(() => {
    const newMode = state.mode === 'push-to-talk' ? 'continuous' : 'push-to-talk';
    setMode(newMode);
  }, [state.mode, setMode]);

  // Debounced auto-restart for continuous mode
  const debouncedRestart = useCallback(
    debounce(() => {
      if (state.mode === 'continuous' && !state.isListening && !state.error) {
        console.log('🎤 Auto-restarting continuous mode');
        startListening();
      }
    }, 1000),
    [state.mode, state.isListening, state.error, startListening]
  );

  // Auto-restart continuous mode when it stops
  useEffect(() => {
    if (state.mode === 'continuous' && !state.isListening && !state.error) {
      debouncedRestart();
    }
  }, [state.mode, state.isListening, state.error, debouncedRestart]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current && state.isListening) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Controls object
  const controls: SpeechControls = {
    startListening,
    stopListening,
    toggleMode,
    clearTranscript,
    setMode
  };

  return {
    state,
    controls
  };
};