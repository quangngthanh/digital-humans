import { useEffect, useCallback } from 'react';
import { useSpeechToText } from '@/hooks/useSpeechToText';

interface VoiceButtonProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
  className?: string;
}

export const VoiceButton = ({ 
  onTranscript, 
  disabled = false, 
  className = "" 
}: VoiceButtonProps) => {
  
  const { state, controls } = useSpeechToText({
    mode: 'push-to-talk', // Default mode
    language: 'vi-VN',
    confidenceThreshold: 0.7,
    autoSend: true,
    onTranscriptComplete: onTranscript,
    onError: (error) => {
      console.error('Speech error:', error);
      // Có thể hiển thị toast notification ở đây
    }
  });

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;
      
      // Space bar for push-to-talk mode
      if (e.code === 'Space' && state.mode === 'push-to-talk' && !state.isListening) {
        e.preventDefault();
        controls.startListening();
      }
      
      // Escape to stop/cancel
      if (e.code === 'Escape' && state.isListening) {
        e.preventDefault();
        controls.stopListening();
        controls.clearTranscript();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (disabled) return;
      
      // Release space bar to stop in push-to-talk mode
      if (e.code === 'Space' && state.mode === 'push-to-talk' && state.isListening) {
        e.preventDefault();
        controls.stopListening();
      }
    };

    // Only add listeners when component is active and supported
    if (state.isSupported) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('keyup', handleKeyUp);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [disabled, state.mode, state.isListening, state.isSupported, controls]);

  // Handle button click based on current mode
  const handleButtonClick = useCallback(() => {
    if (disabled || !state.isSupported) return;

    if (state.mode === 'push-to-talk') {
      // Toggle listening for push-to-talk
      if (state.isListening) {
        controls.stopListening();
      } else {
        controls.startListening();
      }
    } else {
      // Toggle continuous mode
      if (state.isListening) {
        controls.stopListening();
      } else {
        controls.startListening();
      }
    }
  }, [disabled, state.isSupported, state.mode, state.isListening, controls]);

  // Handle mode toggle
  const handleModeToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    controls.toggleMode();
  }, [controls]);

  // Don't render if not supported
  if (!state.isSupported) {
    return null;
  }

  const isActive = state.isListening;
  const showError = !!state.error;
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Mode Toggle Button */}
      <button
        onClick={handleModeToggle}
        disabled={disabled}
        className="bg-gray-500 hover:bg-gray-600 text-white p-2 rounded-md transition-colors text-xs font-medium"
        title={`Current: ${state.mode === 'push-to-talk' ? 'Push-to-Talk' : 'Continuous'}`}
      >
        {state.mode === 'push-to-talk' ? 'PTT' : 'CONT'}
      </button>

      {/* Main Voice Button */}
      <button
        onClick={handleButtonClick}
        disabled={disabled || showError}
        className={`
          p-4 rounded-md transition-all duration-200 font-semibold uppercase
          ${disabled || showError
            ? "cursor-not-allowed opacity-30 bg-gray-400"
            : isActive
            ? "bg-red-500 hover:bg-red-600 animate-pulse text-white shadow-lg scale-105"
            : "bg-blue-500 hover:bg-blue-600 text-white"
          }
        `}
        title={
          state.mode === 'push-to-talk' 
            ? "Hold Space or click and hold to speak"
            : isActive 
            ? "Click to stop listening" 
            : "Click to start listening"
        }
      >
        {/* Microphone Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          {isActive ? (
            // Recording icon
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              fill="currentColor"
            />
          ) : (
            // Microphone icon
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 1v6m0 0a3 3 0 013 3v4a3 3 0 01-6 0v-4a3 3 0 013-3zM5 10.5a7.5 7.5 0 0015 0M12 19v4"
            />
          )}
        </svg>
      </button>

      {/* Status Indicator */}
      {(state.transcript || state.interimTranscript || showError) && (
        <div className="absolute bottom-full mb-2 left-0 right-0 bg-black bg-opacity-75 text-white p-2 rounded-md text-sm">
          {showError ? (
            <span className="text-red-300">{state.error}</span>
          ) : (
            <>
              {state.transcript && (
                <div className="font-medium">{state.transcript}</div>
              )}
              {state.interimTranscript && (
                <div className="text-gray-300 italic">
                  {state.interimTranscript}...
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};