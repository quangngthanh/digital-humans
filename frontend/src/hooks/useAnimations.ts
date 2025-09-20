import { useCallback, useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { ANIMATION_CONFIG, type AnimationName, type IdleAnimationConfig } from '@/constants/animations';
import { logger } from '@/utils/logger';

export type AnimationState = 'idle' | 'talking' | 'playing';

export interface UseAnimationsProps {
  animations: THREE.AnimationClip[];
  group: React.RefObject<THREE.Group>;
}

export interface AnimationControls {
  playAnimation: (name: AnimationName, loop?: boolean | number) => boolean;
  playTalkingAnimation: () => void;
  startIdleSystem: () => void;
  stopIdleSystem: () => void;
  stopAllAnimations: () => void;
  // getCurrentState: () => AnimationState;
  // getCurrentAnimation: () => AnimationName | null;
  updateMixer: (delta: number) => void;
}

export function useAnimations({ animations, group }: UseAnimationsProps): AnimationControls {
  const mixer = useRef<THREE.AnimationMixer | null>(null);
  const currentAction = useRef<THREE.AnimationAction | null>(null);
  const currentAnimationName = useRef<AnimationName | null>(null);
  const [animationState, setAnimationState] = useState<AnimationState>('idle');
  const animationStateRef = useRef<AnimationState>('idle');
  const idleTimer = useRef<NodeJS.Timeout | null>(null);

  // ✅ ADD: Talking animation rotation timer
  const talkingTimer = useRef<NodeJS.Timeout | null>(null);

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
  const playAnimation = useCallback((name: AnimationName, loop: boolean | number = false): boolean => {
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

    try {
      // Stop current action
      if (currentAction.current) {
        currentAction.current.fadeOut(ANIMATION_CONFIG.timing.transitionDuration);
      }

      // Create and configure new action
      const action = currentMixer.clipAction(clip);
      action.reset();
      
      // Handle different loop configurations
      if (typeof loop === 'boolean') {
        action.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, loop ? Infinity : 1);
      } else if (typeof loop === 'number') {
        action.setLoop(THREE.LoopRepeat, loop);
      } else {
        action.setLoop(THREE.LoopOnce, 1);
      }
      
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

      // Set up completion handler for non-looping and finite loop animations
      const shouldSetCompletionHandler = typeof loop === 'boolean' ? !loop : (typeof loop === 'number' && loop >= 1);
      if (shouldSetCompletionHandler) {
        const onFinished = () => {
          if (currentAnimationName.current === name) {
            setAnimationState('idle');
            setTimeout(() => {
              if (animationStateRef.current === 'idle') {
                startIdleSystem();
              }
            }, 1000); // ✅ FIXED: Added missing semicolon
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
  }, [animations, getMixer]);

  // Play random talking animation
  const playTalkingAnimation = useCallback(() => {
    stopIdleSystem();
    setAnimationState('talking');
    
    // ✅ IMPROVED: Start talking animation cycle
    const startTalkingCycle = () => {
      const talkingAnims = ANIMATION_CONFIG.talkingAnimations;
      const randomAnimation = talkingAnims[Math.floor(Math.random() * talkingAnims.length)];
      
      // ✅ FIXED: Use infinite loop to prevent completion handler
      playAnimation(randomAnimation, true); // true = infinite loop
    
      logger.info(`🗣️ Playing talking animation: ${randomAnimation} (infinite)`);
      
      // Schedule next talking animation change (if still talking)
      talkingTimer.current = setTimeout(() => {
        if (animationStateRef.current === 'talking') {
          startTalkingCycle(); // ✅ Cycle to new infinite animation
        }
      }, 6000); // Change animation every 6 seconds
    };
    
    // Start the cycle
    startTalkingCycle();
  }, [playAnimation]);

  // Start idle animation system
  const startIdleSystem = useCallback(() => {
    if (animationState !== 'idle') {
      return;
    }
    
    const playRandomIdle = () => {
      const idleAnims = ANIMATION_CONFIG.idleAnimations as readonly IdleAnimationConfig[];
      const randomConfig = idleAnims[Math.floor(Math.random() * idleAnims.length)];
      const animationName = randomConfig.name;
      const loopConfig = randomConfig.loop;
      
      const success = playAnimation(animationName, loopConfig);
      
      if (success) {
        logger.idleStart(animationName);
        if (typeof loopConfig === 'number' && loopConfig > 1) {
          logger.debug(`🔄 Finite loop animation: ${animationName} (${loopConfig} times)`);
          // Finite loops will be handled by completion handler in playAnimation
        } else if (typeof loopConfig === 'boolean' && loopConfig) {
          logger.debug(`🔄 Infinite loop animation: ${animationName}`);
          logger.debug(`🔄 Infinite loopConfig: ${loopConfig}`);
          // Infinite loop - use random duration
          const delay = Math.random() * 
            (ANIMATION_CONFIG.timing.idleMaxDuration - ANIMATION_CONFIG.timing.idleMinDuration) +
            ANIMATION_CONFIG.timing.idleMinDuration;
          
          idleTimer.current = setTimeout(() => {
            if (animationStateRef.current === 'idle') {
              playRandomIdle();
            }
          }, delay);
        }
      }
    };

    // Play first idle animation immediately
    playRandomIdle();

  }, [playAnimation, animationState]);

  // Stop idle animation system
  const stopIdleSystem = useCallback(() => {
     // Clear tất cả timers
    if (idleTimer.current) {
      clearTimeout(idleTimer.current);
      idleTimer.current = null;
    }
    
    // Clear bất kỳ timer nào khác có thể đang chạy
    // (nếu có multiple timers trong idle system)
    
    // Đảm bảo animation state không phải idle khi đang talking
    if (animationStateRef.current === 'talking') {
      return; // Không restart idle system
    }
    
    logger.info('�� Idle animation system stopped');
  }, []);
  
  // ✅ ADD: Stop talking animation system
  const stopTalkingSystem = useCallback(() => {
    if (talkingTimer.current) {
      clearTimeout(talkingTimer.current);
      talkingTimer.current = null;
    }
    logger.info('🛑 Talking animation system stopped');
  }, []);

  // Stop all animations
  const stopAllAnimations = useCallback(() => {
    if (mixer.current) {
      mixer.current.stopAllAction();
      currentAction.current = null;
      currentAnimationName.current = null;
      setAnimationState('idle');
      logger.info('⏹️ All animations stopped - Set animation state to idle');
    }
    stopIdleSystem();
    stopTalkingSystem(); // ✅ ADD: Also stop talking system
  }, [stopIdleSystem, stopTalkingSystem]);

  // Get current state
  // const getCurrentState = useCallback(() => animationState, [animationState]);
  // console.log('getCurrentState', getCurrentState());

  // // Get current animation name
  // const getCurrentAnimation = useCallback(() => currentAnimationName.current, []);
  // console.log('getCurrentAnimation', getCurrentAnimation());

  // Update mixer in animation frame
  const updateMixer = useCallback((delta: number) => {
    if (mixer.current) {
      mixer.current.update(delta);
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
    // getCurrentState,
    // getCurrentAnimation,
    updateMixer,
  };
}
