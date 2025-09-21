// Enhanced avatar with REAL speech processing - FIXED STATE MANAGEMENT
import { ANIMATION_CONFIG } from '@/constants';
import { VISEME_MAP } from '@/constants/visemeMapping';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export function useAvatar(
  group: React.RefObject<THREE.Group>,
  animations: THREE.AnimationClip[],
  morphTargetControls?: any
) {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use useRef for immediate state access (avoid stale closure)
  const currentStateRef = useRef<'idle' | 'speaking'>('idle');
  const [currentState, setCurrentState] = useState<'idle' | 'speaking'>('idle');
  
  // Helper to update both ref and state
  const updateState = useCallback((newState: 'idle' | 'speaking') => {
    console.log('🔧 State transition:', currentStateRef.current, '→', newState);
    currentStateRef.current = newState;
    setCurrentState(newState);
  }, []);
  
  // Animation refs
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const currentActionRef = useRef<THREE.AnimationAction | null>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Speech refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const speechAnimationRef = useRef<number | null>(null);
  const speechStartTimeRef = useRef<number>(0);
  
  // Speech queue refs
  const speechQueueRef = useRef<any[]>([]);
  const isProcessingSpeechRef = useRef(false);

  // ============================================================================
  // CORE FUNCTIONS FIRST
  // ============================================================================

  // Play specific animation - MOVED TO TOP
  const playAnimation = useCallback((clip: THREE.AnimationClip, infinite: boolean|number = false) => {
    if (!mixerRef.current) {
      console.log('⚠️ Cannot play animation - no mixer');
      return;
    }
    
    try {
      // Stop current animation
      if (currentActionRef.current) {
        currentActionRef.current.fadeOut(0.3);
      }
      
      // Create new action
      const action = mixerRef.current.clipAction(clip);
      action.reset();
      
      // Configure loop
      if (infinite===true) {
        console.log('🔧 Looping animation: infinite');
        action.setLoop(THREE.LoopRepeat, Infinity);
      } else if (typeof infinite === 'number') {
        console.log('🔧 Looping animation:', infinite, 'times');
        action.setLoop(THREE.LoopRepeat, infinite); // Loop 3 times for idle
        action.clampWhenFinished = true;
      }
      
      // Start animation
      action.fadeIn(0.3);
      action.play();
      
      currentActionRef.current = action;
      
    } catch (error) {
      console.error('❌ Animation error:', error);
    }
  }, []);

  // ============================================================================
  // ANIMATION SYSTEMS
  // ============================================================================

  // Start idle animation cycling
  const startIdleAnimations = useCallback(() => {
    console.log('🔧 startIdleAnimations called, currentState:', currentStateRef.current);
    
    if (!mixerRef.current || animations.length === 0) {
      console.log('⚠️ Cannot start idle animations - no mixer or animations');
      return;
    }
    
    if (currentStateRef.current !== 'idle') {
      console.log('⚠️ Cannot start idle animations - not in idle state');
      return;
    }
    
    console.log('✅ Starting idle animation system');
    let delay = 4000 + Math.random() * 6000;
    
    const playRandomIdleAnimation = () => {
      // Double check we're still idle using ref
      if (currentStateRef.current !== 'idle') {
        console.log('🔧 Stopping idle animation - no longer idle');
        return;
      }
      
      // Get idle animations
      const idleAnimNames = Object.entries(ANIMATION_CONFIG.idleAnimations).map(([name, _]) => name);
      const availableIdle = animations.filter(anim => 
        idleAnimNames.some(name => anim.name === name)
      );
      
      // Play random idle animation
      const randomAnim = availableIdle[Math.floor(Math.random() * availableIdle.length)];
      const loop = ANIMATION_CONFIG.idleAnimations[randomAnim?.name as keyof typeof ANIMATION_CONFIG.idleAnimations] as number;
      delay = loop * randomAnim.duration * 1000;
      console.log('🔧 Playing idle animation:', randomAnim.name);
      playAnimation(randomAnim, loop);
    };
    
    // Play first idle animation immediately
    playRandomIdleAnimation();
    
    // Schedule next idle animations
    const scheduleNext = () => {
      idleTimerRef.current = setTimeout(() => {
        if (currentStateRef.current === 'idle') {
          playRandomIdleAnimation();
          scheduleNext();
        } else {
          console.log('🔧 Not scheduling next idle - not in idle state');
        }
      }, delay);
    };
    
    scheduleNext();
    
  }, [animations, playAnimation]);

  // Start talking animations during speech
  const startTalkingAnimations = useCallback(() => {
    if (!mixerRef.current || animations.length === 0) {
      console.log('⚠️ Cannot start talking animations - no mixer or animations');
      return;
    }
    
    const talkingAnimNames = ANIMATION_CONFIG.talkingAnimations;
    const availableTalking = animations.filter(anim => 
      talkingAnimNames.some(name => anim.name.includes(name))
    );
    
    if (availableTalking.length === 0) {
      console.log('🔧 No talking animations found, using first animation');
      // Fallback to first animation if no talking animations
      if (animations.length > 0) {
        playAnimation(animations[0], true);
      }
      return;
    }
    
    console.log('🗣️ Starting talking animation system with', availableTalking.length, 'animations');
    
    const cycleTalkingAnimation = () => {
      // Use ref for immediate state check
      if (currentStateRef.current !== 'speaking') {
        console.log('🔧 Stopped talking animation cycle - not speaking (ref check)');
        return;
      }
      
      const randomAnim = availableTalking[Math.floor(Math.random() * availableTalking.length)];
      console.log('🗣️ Playing talking animation:', randomAnim.name);
      playAnimation(randomAnim, true); // infinite loop for talking
      
      // Schedule next talking animation change
      setTimeout(() => {
        cycleTalkingAnimation();
      }, 4000); // Change talking animation every 3 seconds
    };
    
    // Start immediately
    cycleTalkingAnimation();
  }, [animations, currentState, playAnimation]);

  // ============================================================================
  // AUDIO FUNCTIONS
  // ============================================================================

  // Initialize audio context
  const initAudioContext = useCallback(async () => {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
    
    return audioContextRef.current;
  }, []);

  // Decode base64 audio
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
      console.error('❌ Audio decode error:', error);
      throw error;
    }
  }, [initAudioContext]);

  // lip-sync animation
  const startLipSync = useCallback((lipsyncData: any, duration: number) => {
    if (!morphTargetControls || !lipsyncData?.mouthCues) {
      console.log('🔧 No morph controls or lipsync data, using mouth animation');
      return;
    }

    console.log('🔧 Starting lipsync with', lipsyncData.mouthCues.length, 'cues');
    console.log('🔧 Morph controls available:', !!morphTargetControls);
    console.log('🔧 First few cues:', lipsyncData.mouthCues.slice(0, 3));
    
    // Test morph target controls
    if (morphTargetControls) {
      console.log('🔧 Testing morph target controls...');
      try {
        morphTargetControls.setMorphTarget('viseme_aa', 0.5);
        setTimeout(() => morphTargetControls.setMorphTarget('viseme_aa', 0), 100);
      } catch (e) {
        console.warn('⚠️ Morph target test failed:', e);
      }
    }
    
    speechStartTimeRef.current = Date.now();
    
    const updateLipSync = () => {
      // Use ref for immediate state check to avoid stale closure
      if (currentStateRef.current !== 'speaking') {
        console.log('🔧 Stopping lipsync - not speaking (ref check)');
        return;
      }
      
      const currentTime = (Date.now() - speechStartTimeRef.current) / 1000;
      
      if (currentTime < duration) {
        // Reset all visemes
        Object.values(VISEME_MAP).forEach(morphName => {
          morphTargetControls.setMorphTarget(morphName, 0);
        });
        
        // Find current cue
        const currentCue = lipsyncData.mouthCues.find((cue: any) => 
          currentTime >= cue.start && currentTime <= cue.end
        );
        
        if (currentCue) {
          const morphName = VISEME_MAP[currentCue.value];
          if (morphName) {
            morphTargetControls.setMorphTarget(morphName, 1);
            // console.log('🔧 Lipsync cue:', currentCue.value, '->', morphName, 'at time', currentTime.toFixed(2));
          } else {
            console.warn('⚠️ No morph target found for viseme:', currentCue.value);
          }
        }
        
        speechAnimationRef.current = requestAnimationFrame(updateLipSync);
      } else {
        // Clear all visemes
        Object.values(VISEME_MAP).forEach(morphName => {
          morphTargetControls.lerpMorphTarget(morphName, 0, 0.2);
        });
      }
    };
    
    updateLipSync();
  }, [morphTargetControls]);

  // Process speech queue
  const processSpeechQueue = useCallback(async () => {
    if (isProcessingSpeechRef.current || speechQueueRef.current.length === 0) {
      return;
    }

    isProcessingSpeechRef.current = true;
    console.log('🔧 Processing speech queue, length:', speechQueueRef.current.length);

    while (speechQueueRef.current.length > 0) {
      const message = speechQueueRef.current.shift();
      if (!message) continue;

      console.log('🔧 Processing message from queue:', message.text?.substring(0, 50));
      
      // Process single message
      await processSingleMessage(message);
    }

    isProcessingSpeechRef.current = false;
    console.log('🔧 Speech queue processing completed');
  }, []);

  // Process single message
  const processSingleMessage = useCallback(async (message: any) => {
    if (!message?.audio || !message?.lipsync) {
      console.log('🔧 No audio/lipsync data, simulating speech');
      updateState('speaking');
      
      // Stop idle animations
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
      
      // Start talking animations
      startTalkingAnimations();
      
      // Simulate speech duration
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      updateState('idle');
      setTimeout(() => startIdleAnimations(), 100);
      return;
    }

    try {
      console.log('🔧 Starting real speech processing...');
      updateState('speaking');
      
      // Stop any existing audio and speech animation first
      if (audioSourceRef.current) {
        console.log('🔧 Stopping existing audio');
        try {
          audioSourceRef.current.stop();
        } catch (e) {
          // Ignore if already stopped
        }
        audioSourceRef.current = null;
      }
      
      if (speechAnimationRef.current) {
        console.log('🔧 Stopping existing speech animation');
        cancelAnimationFrame(speechAnimationRef.current);
        speechAnimationRef.current = null;
      }
      
      // Stop idle animations
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
      
      // Start talking animations
      startTalkingAnimations();
      
      // Decode and play audio
      console.log('🔧 Decoding audio...');
      const audioBuffer = await decodeAudio(message.audio);
      const audioContext = await initAudioContext();
      
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      
      audioSourceRef.current = source;
      
      // Start lip-sync
      const duration = message.lipsync.metadata.duration;
      console.log('🔧 Starting lip-sync, duration:', duration);
      startLipSync(message.lipsync, duration);
      
      // Play audio
      source.start();
      console.log('✅ Audio started, duration:', duration);
      
      // Wait for audio to finish
      await new Promise<boolean>((resolve) => {
        source.onended = () => {
          console.log('✅ Audio finished');
          
          // Stop lip-sync animation
          if (speechAnimationRef.current) {
            cancelAnimationFrame(speechAnimationRef.current);
            speechAnimationRef.current = null;
          }
          
          // Clear audio source
          audioSourceRef.current = null;
          
          // Return to idle
          console.log('🔧 Returning to idle state');
          updateState('idle');
          
          // Small delay before starting idle animations
          setTimeout(() => {
            startIdleAnimations();
          }, 100);
          
          resolve(true);
        };
        
        // Timeout fallback
        setTimeout(() => {
          if (audioSourceRef.current === source) {
            console.log('⚠️ Speech timeout, forcing completion');
            source.onended = null;
            try {
              source.stop();
            } catch (e) {
              // Ignore if already stopped
            }
            audioSourceRef.current = null;
            
            if (speechAnimationRef.current) {
              cancelAnimationFrame(speechAnimationRef.current);
              speechAnimationRef.current = null;
            }
            
            updateState('idle');
            setTimeout(() => {
              startIdleAnimations();
            }, 100);
            
            resolve(true);
          }
        }, (duration + 1) * 1000);
      });
      
    } catch (error) {
      console.error('❌ Speech error:', error);
      updateState('idle');
      setTimeout(() => {
        startIdleAnimations();
      }, 100);
    }
  }, [updateState, startIdleAnimations, startTalkingAnimations, decodeAudio, initAudioContext, startLipSync]);

  // Real speech function with audio and lip-sync
  const speak = useCallback(async (message: any) => {
    console.log('🔧 Real speech processing:', message);
    
    // Prevent duplicate speech processing using ref
    if (currentStateRef.current === 'speaking') {
      console.log('⚠️ Already speaking, ignoring new speech request');
      return false;
    }

    // Add to speech queue instead of processing immediately
    if (!speechQueueRef.current) {
      speechQueueRef.current = [];
    }
    
    speechQueueRef.current.push(message);
    console.log('🔧 Added to speech queue, length:', speechQueueRef.current.length);
    
    // Process queue if not already processing
    if (!isProcessingSpeechRef.current) {
      processSpeechQueue();
    }
    
    return true;
  }, [processSpeechQueue]);

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  // Track if avatar is already initialized to prevent re-initialization during speech
  const isInitializedRef = useRef(false);

  // Initialize mixer and start idle animations
  useEffect(() => {
    // Prevent re-initialization if already initialized and currently speaking
    if (isInitializedRef.current && currentStateRef.current === 'speaking') {
      console.log('🔧 Skipping re-initialization - currently speaking');
      return;
    }

    console.log('🔧 useAvatar initializing...');
    
    try {
      if (group.current && animations.length > 0) {
        // Clean up existing mixer first
        if (mixerRef.current) {
          mixerRef.current.stopAllAction();
          mixerRef.current = null;
        }

        // Stop any existing audio
        if (audioSourceRef.current) {
          try {
            audioSourceRef.current.stop();
          } catch (e) {
            // Ignore if already stopped
          }
          audioSourceRef.current = null;
        }

        // Create mixer
        mixerRef.current = new THREE.AnimationMixer(group.current);
        
        setIsReady(true);
        setError(null);
        isInitializedRef.current = true;
        console.log('✅ Avatar ready with', animations.length, 'animations!');
        
        // Only start idle animations if not currently speaking
        if (currentStateRef.current === 'idle') {
          setTimeout(() => startIdleAnimations(), 100);
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error('❌ Avatar error:', err);
      setError(errorMsg);
    }
  }, [group, animations]);

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  // Stop speech
  const stopSpeech = useCallback(() => {
    console.log('🔧 Stopping speech');
    
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop();
      } catch (error) {
        // Ignore errors from already stopped audio
      }
      audioSourceRef.current = null;
    }
    
    if (speechAnimationRef.current) {
      cancelAnimationFrame(speechAnimationRef.current);
      speechAnimationRef.current = null;
    }
    
    // Clear all visemes
    if (morphTargetControls) {
      Object.entries(VISEME_MAP).forEach(([_, value]) => {
        morphTargetControls.lerpMorphTarget(value, 0, 0.1);
      });
    }
    
    setCurrentState('idle');
    setTimeout(() => startIdleAnimations(), 100);
  }, [morphTargetControls, startIdleAnimations]);

  // Mixer update (call from useFrame)
  const updateMixer = useCallback((deltaTime: number) => {
    if (mixerRef.current) {
      mixerRef.current.update(deltaTime);
    }
  }, []);

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  // Controls object
  const controls = {
    speak,
    stopSpeaking: async () => {
      stopSpeech();
      return true;
    },
    startListening: async () => true,
    startThinking: async () => true,
    goIdle: async () => {
      stopSpeech();
      return true;
    },
    playAnimation: async (name: string) => {
      const clip = animations.find(anim => anim.name === name);
      if (clip) {
        playAnimation(clip);
        return true;
      }
      return false;
    },
    updateMixer,
    on: () => {},
    off: () => {},
    getPerformanceMetrics: () => ({ 
      advanced: true, 
      ready: isReady, 
      currentState,
      availableAnimations: animations.map(a => a.name),
      hasAudio: !!audioContextRef.current,
      isSpeaking: currentState === 'speaking'
    })
  };

  // State object
  const state = {
    isInitialized: isReady,
    currentState: currentState,
    isSpeaking: currentState === 'speaking',
    isListening: false,
    isThinking: false,
    isIdle: currentState === 'idle',
    speechQueueLength: 0,
    error
  };

  // ============================================================================
  // CLEANUP
  // ============================================================================

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
      }
      if (audioSourceRef.current) {
        audioSourceRef.current.stop();
      }
      if (speechAnimationRef.current) {
        cancelAnimationFrame(speechAnimationRef.current);
      }
    };
  }, []);

  return { state, controls };
}
