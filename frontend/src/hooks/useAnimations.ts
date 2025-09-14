import { useCallback, useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { ANIMATION_CONFIG, type AnimationName } from '@/constants/animations';
import { logger } from '@/utils/logger';

export type AnimationState = 'idle' | 'talking' | 'playing';

export interface UseAnimationsProps {
  animations: THREE.AnimationClip[];
  group: React.RefObject<THREE.Group>;
}

export interface AnimationControls {
  playAnimation: (name: AnimationName, loop?: boolean) => boolean;
  playTalkingAnimation: () => void;
  startIdleSystem: () => void;
  stopIdleSystem: () => void;
  stopAllAnimations: () => void;
  getCurrentState: () => AnimationState;
  getCurrentAnimation: () => AnimationName | null;
  updateMixer: (delta: number) => void;
  // ✅ Debug function to test animation playback
  debugAnimation: (name: AnimationName) => void;
  // ✅ Function to adjust animation speed
  setTimeScale: (scale: number) => void;
}

export function useAnimations({ animations, group }: UseAnimationsProps): AnimationControls {
  const mixer = useRef<THREE.AnimationMixer | null>(null);
  const currentAction = useRef<THREE.AnimationAction | null>(null);
  const currentAnimationName = useRef<AnimationName | null>(null);
  const [animationState, setAnimationState] = useState<AnimationState>('idle');
  const animationStateRef = useRef<AnimationState>('idle'); // ✅ Fix stale closure
  const idleTimer = useRef<NodeJS.Timeout | null>(null);

  // Suppress Three.js PropertyBinding warnings
  useEffect(() => {
    const originalWarn = console.warn;
    
    console.warn = (...args: any[]) => {
      const message = args.join(' ');
      
      // Suppress specific Three.js PropertyBinding errors
      if (message.includes('THREE.PropertyBinding') && 
          message.includes('wasn\'t found')) {
        return; // Suppress this warning
      }
      
      // Allow other warnings
      originalWarn.apply(console, args);
    };

    // Cleanup on unmount
    return () => {
      console.warn = originalWarn;
    };
  }, []);

  // Initialize mixer
  const getMixer = useCallback(() => {
    if (!mixer.current && group.current && animations.length > 0) {
      mixer.current = new THREE.AnimationMixer(group.current);
    }
    return mixer.current;
  }, [animations, group]);

  // Play specific animation
  const playAnimation = useCallback((name: AnimationName, loop: boolean = false): boolean => {
    logger.animationStart(name);
    
    const currentMixer = getMixer();
    if (!currentMixer || !animations.length) {
      logger.warn('Mixer or animations not ready');
      return false;
    }

    const clip = animations.find(anim => anim.name === name);
    if (!clip) {
      logger.warn(`Animation "${name}" not found in available animations:`, 
        animations.map(a => a.name));
      return false;
    }

    // ✅ Debug: Log animation clip details
    logger.debug(`🎬 Animation Clip Details:`, {
      name: clip.name,
      duration: clip.duration,
      tracks: clip.tracks.length,
      loop: loop
    });

    try {
      // Stop current action
      if (currentAction.current) {
        currentAction.current.fadeOut(ANIMATION_CONFIG.timing.transitionDuration);
      }

      // Create and configure new action
      const action = currentMixer.clipAction(clip);
      action.reset();
      action.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, loop ? Infinity : 1);
      // ✅ Fix: Don't clamp when finished for non-looping animations to allow full playback
      action.clampWhenFinished = loop; // Only clamp for looping animations
      
      // ✅ Ensure proper time scale for full animation playback
      action.timeScale = 1.0; // Normal speed
      
      // ✅ Ensure animation plays from start to end
      action.time = 0; // Start from beginning
      action.enabled = true; // Ensure action is enabled
      
      // ✅ Debug: Log action configuration
      logger.debug(`⚙️ Action Configuration:`, {
        loop: loop,
        loopCount: loop ? Infinity : 1,
        clampWhenFinished: action.clampWhenFinished,
        timeScale: action.timeScale,
        enabled: action.enabled,
        startTime: action.time,
        expectedDuration: clip.duration,
        adjustedDuration: clip.duration / action.timeScale // Expected actual duration
      });
      
      // Fade in new animation
      if (currentAction.current) {
        action.crossFadeFrom(currentAction.current, ANIMATION_CONFIG.timing.transitionDuration, true);
      } else {
        action.fadeIn(ANIMATION_CONFIG.timing.transitionDuration);
      }
      
      action.play();
      
      currentAction.current = action;
      currentAnimationName.current = name;
      setAnimationState('playing');

      // Set up completion handler for non-looping animations
      if (!loop) {
        const startTime = Date.now();
        const onFinished = () => {
          const actualDuration = Date.now() - startTime;
          logger.debug(`🏁 Animation Finished:`, {
            name: name,
            expectedDuration: clip.duration * 1000, // Convert to ms
            actualDuration: actualDuration,
            durationDiff: actualDuration - (clip.duration * 1000)
          });
          
          if (currentAnimationName.current === name) {
            setAnimationState('idle');
            // ✅ Simplified: Just trigger idle system after animation finishes
            setTimeout(() => {
              if (animationStateRef.current === 'idle') {
                startIdleSystem();
              }
            }, 100); // Small delay to ensure state is updated
          }
          currentMixer.removeEventListener('finished', onFinished);
        };
        currentMixer.addEventListener('finished', onFinished);
      }

      logger.success(`Animation "${name}" started successfully`);
      return true;
    } catch (error) {
      logger.animationError(name, error);
      return false;
    }
  }, [animations, getMixer]); // ✅ Remove startIdleSystem from dependencies

  // Play random talking animation
  const playTalkingAnimation = useCallback(() => {
    const talkingAnims = ANIMATION_CONFIG.talkingAnimations;
    const randomAnimation = talkingAnims[Math.floor(Math.random() * talkingAnims.length)];
    
    stopIdleSystem(); // Stop idle system when talking
    setAnimationState('talking');
    playAnimation(randomAnimation);
    
    logger.info(`🗣️ Playing talking animation: ${randomAnimation}`);
  }, [playAnimation]);

  // Start idle animation system
  const startIdleSystem = useCallback(() => {
    // ✅ Don't start idle system if not in idle state
    if (animationState !== 'idle') {
      logger.debug(`Skipping idle system - State: ${animationState}`);
      return;
    }
    
    const playRandomIdle = () => {
      const idleAnims = ANIMATION_CONFIG.idleAnimations;
      const randomAnimation = idleAnims[Math.floor(Math.random() * idleAnims.length)];
      // ✅ Fix: Play idle animations as looping to prevent interruption
      const success = playAnimation(randomAnimation, true); // Looping
      
      if (success) {
        logger.idleStart(randomAnimation);
        
        // ✅ Schedule next idle animation after a random duration
        const nextIdleDelay = Math.random() * 
          (ANIMATION_CONFIG.timing.idleMaxDuration - ANIMATION_CONFIG.timing.idleMinDuration) +
          ANIMATION_CONFIG.timing.idleMinDuration;
        
        idleTimer.current = setTimeout(() => {
          if (animationStateRef.current === 'idle') {
            playRandomIdle(); // Play next random idle animation
          }
        }, nextIdleDelay);
      }
    };

    // Play first idle animation immediately
    playRandomIdle();
    logger.info('😴 Idle animation system started');
  }, [playAnimation, animationState]);

  // Stop idle animation system
  const stopIdleSystem = useCallback(() => {
    if (idleTimer.current) {
      clearTimeout(idleTimer.current);
      idleTimer.current = null;
      logger.info('😴 Idle animation system stopped');
    }
  }, []);

  // Stop all animations
  const stopAllAnimations = useCallback(() => {
    if (mixer.current) {
      mixer.current.stopAllAction();
      currentAction.current = null;
      currentAnimationName.current = null;
      setAnimationState('idle');
      logger.info('⏹️ All animations stopped');
    }
    stopIdleSystem();
  }, [stopIdleSystem]);

  // Get current state
  const getCurrentState = useCallback(() => animationState, [animationState]);
  
  // Get current animation name
  const getCurrentAnimation = useCallback(() => currentAnimationName.current, []);

  // Update mixer in animation frame
  const updateMixer = useCallback((delta: number) => {
    if (mixer.current) {
      mixer.current.update(delta);
    }
  }, []);

  // ✅ Debug function to test animation playback
  const debugAnimation = useCallback((name: AnimationName) => {
    logger.debug(`🔍 Debug Animation: ${name}`);
    
    const clip = animations.find(anim => anim.name === name);
    if (!clip) {
      logger.warn(`Animation "${name}" not found`);
      return;
    }
    
    logger.debug(`📊 Animation Analysis:`, {
      name: clip.name,
      duration: clip.duration,
      tracks: clip.tracks.length,
      trackNames: clip.tracks.map(track => track.name),
      totalKeyframes: clip.tracks.reduce((sum, track) => sum + track.times.length, 0)
    });
    
    // Test playback
    const success = playAnimation(name, false);
    if (success) {
      logger.info(`✅ Debug playback started for: ${name}`);
    } else {
      logger.error(`❌ Debug playback failed for: ${name}`);
    }
  }, [animations, playAnimation]);

  // ✅ Function to adjust animation speed
  const setTimeScale = useCallback((scale: number) => {
    if (currentAction.current) {
      currentAction.current.timeScale = scale;
      logger.info(`⚙️ TimeScale changed to: ${scale}`);
    } else {
      logger.warn('No active animation to adjust timeScale');
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllAnimations();
      if (mixer.current) {
        mixer.current = null;
      }
    };
  }, [stopAllAnimations]);

  // ✅ Sync state with ref to avoid stale closure
  useEffect(() => {
    animationStateRef.current = animationState;
  }, [animationState]);

  // ✅ Debug: Log all loaded animations
  useEffect(() => {
    if (animations.length > 0) {
      logger.debug(`📋 All Loaded Animations:`, animations.map(anim => ({
        name: anim.name,
        duration: anim.duration,
        tracks: anim.tracks.length
      })));
    }
  }, [animations]);

  // Start idle system when animations are loaded
  useEffect(() => {
    if (animations.length > 0 && animationState === 'idle') {
      startIdleSystem();
    }
  }, [animations, startIdleSystem, animationState]);

  return {
    playAnimation,
    playTalkingAnimation,
    startIdleSystem,
    stopIdleSystem,
    stopAllAnimations,
    getCurrentState,
    getCurrentAnimation,
    updateMixer,
    debugAnimation,
    setTimeScale,
  };
}
