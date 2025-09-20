import { useCallback, useEffect, useRef, useState } from 'react';
import type { MessageResponse, EmotionalIntent, LipSyncData } from '@/types';
import type { MorphTargetControls } from './useMorphTargets';
import { corresponding as VISEME_MAP } from '@/constants/visemeMapping';
import { facialExpressions, expressionUtils } from '@/constants';
import { useMounted } from '@/hooks/share/useMounted';

// Emotion mapping from emotion names to facial expressions
const EMOTION_MAP: Record<string, any> = {
  happy: facialExpressions.joy,
  sad: facialExpressions.sad,
  angry: facialExpressions.angry,
  surprised: facialExpressions.surprised,
  fear: facialExpressions.fear,
  disgusted: facialExpressions.disgusted,
  excited: facialExpressions.euphoric,
  confused: facialExpressions.confused,
  thoughtful: facialExpressions.thoughtful,
  playful: facialExpressions.playful,
  romantic: facialExpressions.flirtatious,
  caring: facialExpressions.welcoming,
  mischievous: facialExpressions.mischievous,
  shy: facialExpressions.embarrassed,
  confident: facialExpressions.proud,
  curious: facialExpressions.curious,
  serious: facialExpressions.focused,
  frustrated: facialExpressions.frustrated,
  // Default fallbacks
  joy: facialExpressions.joy,
  neutral: facialExpressions.default,
  default: facialExpressions.default,
};

export interface AvatarSpeechState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
}

export interface AvatarSpeechControls {
  state: AvatarSpeechState;
  stop: () => void;
}

export function useAvatarSpeech(
  messages: MessageResponse[],
  morphControls: MorphTargetControls,
  onMessagePlayed?: () => void,
  animationControls?: { playTalkingAnimation: () => void; stopAllAnimations: () => void }
): AvatarSpeechControls {
  const [state, setState] = useState<AvatarSpeechState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
  });
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  const isCleaningUpRef = useRef<boolean>(false);
  const isPlayingRef = useRef<boolean>(false);
  const stopRef = useRef<(() => void) | null>(null);
  const isMounted = useMounted();

  
  // Initialize AudioContext
  const initAudioContext = useCallback(async () => {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
    
    return audioContextRef.current;
  }, []);

  // Decode base64 audio to AudioBuffer
  const decodeAudio = useCallback(async (base64Audio: string): Promise<AudioBuffer> => {
    try {
      const audioContext = await initAudioContext();
      const audioData = base64Audio.replace(/^data:audio\/[^;]+;base64,/, '');

      const binaryString = atob(audioData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      return await audioContext.decodeAudioData(bytes.buffer);
    } catch (error) {
      throw error;
    }
  }, [initAudioContext]);

  // Apply emotional expressions (with speech adaptation option)
  const applyEmotionalExpression = useCallback((emotion: EmotionalIntent, isSpeaking: boolean = false) => {
    const expressionMorphs = EMOTION_MAP[emotion.primary.toLowerCase()];
    if (!expressionMorphs) return;
    
    let finalMorphs = expressionMorphs;
    
    // Adapt expression for speech mode to prevent mouth conflicts
    if (isSpeaking) {
      finalMorphs = expressionUtils.adaptExpressionForSpeech(
        expressionMorphs, 
        emotion.primary.toLowerCase()
      );
    }
    
    // Apply primary emotion with intensity scaling
    Object.entries(finalMorphs).forEach(([morphName, baseValue]) => {
      const scaledValue = (baseValue as number) * emotion.intensity;
      morphControls.lerpMorphTarget(morphName, scaledValue, 0.1);
    });
    
    // Apply secondary emotion if present (at 30% intensity)
    if (emotion.secondaryEmotion) {
      const secondaryMorphs = EMOTION_MAP[emotion.secondaryEmotion.toLowerCase()];
      if (secondaryMorphs) {
        let finalSecondaryMorphs = secondaryMorphs;
        
        // Also adapt secondary emotion for speech
        if (isSpeaking) {
          finalSecondaryMorphs = expressionUtils.adaptExpressionForSpeech(
            secondaryMorphs,
            emotion.secondaryEmotion.toLowerCase()
          );
        }
        
        Object.entries(finalSecondaryMorphs).forEach(([morphName, baseValue]) => {
          const scaledValue = (baseValue as number) * emotion.intensity * 0.3;
          morphControls.lerpMorphTarget(morphName, scaledValue, 0.1);
        });
      }
    }
  }, [morphControls]);

  // Clear emotional expressions (with speech adaptation option)
  const clearEmotionalExpression = useCallback((emotion: EmotionalIntent, wasSpeaking: boolean = false) => {
    const expressionMorphs = EMOTION_MAP[emotion.primary.toLowerCase()];
    if (expressionMorphs) {
      let morphsToReset = expressionMorphs;
      
      // If we were speaking, we need to reset the adapted morphs
      if (wasSpeaking) {
        morphsToReset = expressionUtils.adaptExpressionForSpeech(
          expressionMorphs,
          emotion.primary.toLowerCase()
        );
      }
      
      Object.keys(morphsToReset).forEach((morphName) => {
        morphControls.lerpMorphTarget(morphName, 0, 0.1);
      });
    }
    
    if (emotion.secondaryEmotion) {
      const secondaryMorphs = EMOTION_MAP[emotion.secondaryEmotion.toLowerCase()];
      if (secondaryMorphs) {
        let secondaryMorphsToReset = secondaryMorphs;
        
        if (wasSpeaking) {
          secondaryMorphsToReset = expressionUtils.adaptExpressionForSpeech(
            secondaryMorphs,
            emotion.secondaryEmotion.toLowerCase()
          );
        }
        
        Object.keys(secondaryMorphsToReset).forEach((morphName) => {
          morphControls.lerpMorphTarget(morphName, 0, 0.1);
        });
      }
    }
  }, [morphControls]);

  // Apply lipsync based on current time
  // NOTE: Lip-sync has FULL CONTROL over mouth morphs during speech
  // Emotional expressions are adapted to exclude mouth morphs to prevent conflicts
  const updateLipsync = useCallback((currentTime: number, lipsyncData: LipSyncData) => {
    if (!lipsyncData?.mouthCues) return;
    
    // Reset all viseme morphs first - this ensures clean mouth state
    Object.values(VISEME_MAP).forEach(morphName => {
      morphControls.setMorphTarget(morphName, 0);
    });
    
    // Find current mouth cue
    const currentCue = lipsyncData.mouthCues.find((cue: any) => 
      currentTime >= cue.start && currentTime <= cue.end
    );
    
    if (currentCue) {
      const morphName = VISEME_MAP[currentCue.value];
      if (morphName) {
        // Apply viseme morph with full intensity for accurate lip-sync
        morphControls.setMorphTarget(morphName, 1);
      }
    }
  }, [morphControls]);

  // Animation loop for lipsync
  const animationLoop = useCallback((lipsyncData: LipSyncData, duration: number) => {
    const animate = () => {
      if (isCleaningUpRef.current || !isMounted()) return;
      
      const currentTime = (Date.now() - startTimeRef.current) / 1000;
      
      setState(prev => ({ ...prev, currentTime }));
      
      if (currentTime < duration) {
        updateLipsync(currentTime, lipsyncData);
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Speech finished
        if (isMounted()) {
          setState(prev => ({ ...prev, isPlaying: false, currentTime: duration }));
          
          // Clear all viseme morphs
          Object.values(VISEME_MAP).forEach(morphName => {
            morphControls.lerpMorphTarget(morphName, 0, 0.1);
          });
        }
      }
    };
    
    animate();
  }, [updateLipsync, morphControls]);

  // Stop speech
  const stop = useCallback(() => {
    if (!isMounted()) return;
    
    // Only stop if actually playing
    if (!isPlayingRef.current && !audioSourceRef.current) {
      console.log('Stop called but nothing is playing, ignoring...');
      return;
    }
    
    console.log('Stopping speech, setting cleanup flag...');
    isCleaningUpRef.current = true;
    
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop();
      } catch (error) {
        // AudioBufferSourceNode might already be stopped
      }
      try {
        audioSourceRef.current.disconnect();
      } catch (error) {
        // Node might already be disconnected
      }
      audioSourceRef.current = null;
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = undefined;
    }
    
    isPlayingRef.current = false;
    setState({ isPlaying: false, currentTime: 0, duration: 0 });
    
    // Clear all morphs
    Object.values(VISEME_MAP).forEach(morphName => {
      morphControls.lerpMorphTarget(morphName, 0, 0.1);
    });
    
    // Reset cleanup flag immediately instead of using setTimeout
    console.log('Resetting cleanup flag...');
    isCleaningUpRef.current = false;
  }, [morphControls, state.isPlaying]);

  // Update stopRef
  stopRef.current = stop;

  // Sync isPlayingRef with state changes
  useEffect(() => {
    isPlayingRef.current = state.isPlaying;
  }, [state.isPlaying]);

  // Main effect to handle new messages
  useEffect(() => {
    console.log('useEffect triggered - messages:', messages.length, 'isPlaying:', state.isPlaying, 'isCleaningUp:', isCleaningUpRef.current);
    
    if (messages.length === 0) {
      console.log('No messages in queue');
      return;
    }
    
    // Nếu đang phát hoặc đang dọn dẹp, đợi message hiện tại kết thúc
    if (isPlayingRef.current || isCleaningUpRef.current || audioSourceRef.current) {
      console.log('Already playing or cleaning up, waiting for current message to finish');
      console.log('State - isPlayingRef:', isPlayingRef.current, 'isCleaningUp:', isCleaningUpRef.current, 'hasAudioSource:', !!audioSourceRef.current);
      return;
    }
    
    // Chỉ xử lý message đầu tiên trong queue
    const message = messages[0];
    if (!message?.audio || !message?.lipsync) {
      console.log('Invalid message, skipping to next');
      // Nếu message không hợp lệ, gọi callback để xóa nó khỏi queue
      if (onMessagePlayed) {
        onMessagePlayed();
      }
      return;
    }
    
    const startSpeech = async () => {
      try {
        console.log('Starting speech process...');
        console.log('Message has audio:', !!message.audio, 'has lipsync:', !!message.lipsync);
        
        // Ensure we're not in cleanup state
        isCleaningUpRef.current = false;
        
        console.log('Starting speech with message:', message.text);
        console.log('Queue remaining:', messages.length, 'messages');
                
        // Decode and play audio
        const audioBuffer = await decodeAudio(message.audio!);
        const audioContext = await initAudioContext();
        
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        
        audioSourceRef.current = source;
        startTimeRef.current = Date.now();
        
        const duration = message.lipsync!.metadata.duration;
        
        isPlayingRef.current = true;
        setState({
          isPlaying: true,
          currentTime: 0,
          duration,
        });
        
        console.log('Set isPlaying to true, duration:', duration);
        
        // Start talking animation
        if (animationControls?.playTalkingAnimation) {
          animationControls.playTalkingAnimation();
        }
        
        // Apply emotional expression WITH speech adaptation
        applyEmotionalExpression(message.emotionalIntent, true); // 👈 isSpeaking = true
        
        // Start audio
        source.start();
        console.log('Audio started');
        
        // Start lipsync animation
        animationLoop(message.lipsync!, duration);
        
        // Clean up when audio ends
        source.onended = () => {
          if (!isCleaningUpRef.current && isMounted()) {
            console.log('Speech ended, cleaning up...');
            
            // Clear audio source reference FIRST
            audioSourceRef.current = null;
            isPlayingRef.current = false;
            setState(prev => ({ ...prev, isPlaying: false }));
            clearEmotionalExpression(message.emotionalIntent, true); // 👈 wasSpeaking = true
            
            // Stop talking animation
            if (animationControls?.stopAllAnimations) {
              animationControls.stopAllAnimations();
            }
            
            // Clear all viseme morphs
            Object.values(VISEME_MAP).forEach(morphName => {
              morphControls.lerpMorphTarget(morphName, 0, 0.1);
            });
            
            // Call onMessagePlayed to remove from queue and trigger next message
            if (onMessagePlayed) {
              console.log('Calling onMessagePlayed to process next message');
              onMessagePlayed();
              console.log('onMessagePlayed called, audioSourceRef cleared:', audioSourceRef.current === null);
            }
          }
        };
        
      } catch (error) {
        console.error('Error starting speech:', error);
        
        // Clear audio source on error
        audioSourceRef.current = null;
        isPlayingRef.current = false;
        setState({ isPlaying: false, currentTime: 0, duration: 0 });
        
        // Stop animation on error
        if (animationControls?.stopAllAnimations) {
          animationControls.stopAllAnimations();
        }
        
        // Still call onMessagePlayed on error to prevent stuck queue
        if (onMessagePlayed) {
          console.log('Error occurred, moving to next message');
          onMessagePlayed();
        }
      }
    };
    
    startSpeech();
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => {
    console.log('useAvatarSpeech mounted');
    
    return () => {
      console.log('useAvatarSpeech unmounting, calling stop...');
      if (stopRef.current) {
        stopRef.current();
      }
      
      // Don't close AudioContext here, let it be garbage collected
      // Closing it causes "Cannot close a closed AudioContext" errors
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        // Just set to null, don't close
        audioContextRef.current = null;
      }
    };
  }, []);

  return {
    state,
    stop,
  };
}