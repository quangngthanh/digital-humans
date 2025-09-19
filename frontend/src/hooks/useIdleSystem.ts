import { useEffect, useRef, useCallback } from 'react';
import type { MorphTargetControls } from './useMorphTargets';

interface IdleAnimationConfig {
  interval: [number, number]; // Min and max interval in seconds
  enabled: boolean;
}

interface IdleSystemControls {
  startIdleSystem: () => void;
  stopIdleSystem: () => void;
  setEnabled: (enabled: boolean) => void;
}

// Idle animation patterns
const IDLE_ANIMATIONS = [
  // Subtle eye movements
  {
    name: 'lookAround',
    duration: 2000,
    morphs: [
      { target: 'eyeLookUpLeft', value: 0.3, delay: 0 },
      { target: 'eyeLookUpRight', value: 0.3, delay: 0 },
      { target: 'eyeLookUpLeft', value: 0, delay: 1000 },
      { target: 'eyeLookUpRight', value: 0, delay: 1000 },
    ]
  },
  {
    name: 'lookLeft',
    duration: 1500,
    morphs: [
      { target: 'eyeLookOutLeft', value: 0.4, delay: 0 },
      { target: 'eyeLookInRight', value: 0.4, delay: 0 },
      { target: 'eyeLookOutLeft', value: 0, delay: 800 },
      { target: 'eyeLookInRight', value: 0, delay: 800 },
    ]
  },
  {
    name: 'lookRight',
    duration: 1500,
    morphs: [
      { target: 'eyeLookInLeft', value: 0.4, delay: 0 },
      { target: 'eyeLookOutRight', value: 0.4, delay: 0 },
      { target: 'eyeLookInLeft', value: 0, delay: 800 },
      { target: 'eyeLookOutRight', value: 0, delay: 800 },
    ]
  },
  // Subtle breathing/chest movement (if available)
  {
    name: 'subtleSmile',
    duration: 3000,
    morphs: [
      { target: 'mouthSmileLeft', value: 0.1, delay: 0 },
      { target: 'mouthSmileRight', value: 0.1, delay: 0 },
      { target: 'mouthSmileLeft', value: 0, delay: 2000 },
      { target: 'mouthSmileRight', value: 0, delay: 2000 },
    ]
  },
  // Eyebrow movements
  {
    name: 'browRaise',
    duration: 1800,
    morphs: [
      { target: 'browInnerUp', value: 0.2, delay: 0 },
      { target: 'browInnerUp', value: 0, delay: 1200 },
    ]
  }
];

export function useIdleSystem(
  morphControls: MorphTargetControls,
  isSpeaking: boolean = false,
  config: IdleAnimationConfig = {
    interval: [3, 8], // 3-8 seconds between animations
    enabled: true
  }
): IdleSystemControls {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const isRunningRef = useRef<boolean>(false);
  const configRef = useRef<IdleAnimationConfig>(config);
  
  // Update config reference
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  // Execute a random idle animation
  const executeIdleAnimation = useCallback(() => {
    if (isSpeaking || !configRef.current.enabled) return;
    
    const animation = IDLE_ANIMATIONS[Math.floor(Math.random() * IDLE_ANIMATIONS.length)];
    
    // Execute each morph in the animation
    animation.morphs.forEach(({ target, value, delay }) => {
      setTimeout(() => {
        if (!isSpeaking) { // Double check we're still not speaking
          morphControls.lerpMorphTarget(target, value, 0.05);
        }
      }, delay);
    });
  }, [isSpeaking, morphControls]);

  // Schedule next idle animation
  const scheduleNextAnimation = useCallback(() => {
    if (!configRef.current.enabled || isSpeaking) return;
    
    const [minInterval, maxInterval] = configRef.current.interval;
    const randomInterval = minInterval + Math.random() * (maxInterval - minInterval);
    
    timeoutRef.current = setTimeout(() => {
      if (isRunningRef.current && !isSpeaking) {
        executeIdleAnimation();
        scheduleNextAnimation(); // Schedule next one
      }
    }, randomInterval * 1000);
  }, [executeIdleAnimation, isSpeaking]);

  // Start idle system
  const startIdleSystem = useCallback(() => {
    if (!isRunningRef.current) {
      isRunningRef.current = true;
      scheduleNextAnimation();
    }
  }, [scheduleNextAnimation]);

  // Stop idle system
  const stopIdleSystem = useCallback(() => {
    isRunningRef.current = false;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }, []);

  // Enable/disable system
  const setEnabled = useCallback((enabled: boolean) => {
    configRef.current = { ...configRef.current, enabled };
    if (!enabled) {
      stopIdleSystem();
    } else if (!isSpeaking) {
      startIdleSystem();
    }
  }, [startIdleSystem, stopIdleSystem, isSpeaking]);

  // Auto start/stop based on speaking state
  useEffect(() => {
    if (isSpeaking) {
      stopIdleSystem();
    } else if (configRef.current.enabled) {
      // Small delay before starting idle animations after speech
      const startDelay = setTimeout(() => {
        startIdleSystem();
      }, 1000);
      
      return () => clearTimeout(startDelay);
    }
  }, [isSpeaking, startIdleSystem, stopIdleSystem]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopIdleSystem();
    };
  }, [stopIdleSystem]);

  // Auto-start on mount if enabled
  useEffect(() => {
    if (config.enabled && !isSpeaking) {
      startIdleSystem();
    }
  }, []); // Only on mount

  return {
    startIdleSystem,
    stopIdleSystem,
    setEnabled,
  };
}