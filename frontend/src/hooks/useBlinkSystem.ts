import { useCallback, useEffect, useRef } from 'react';
import { ANIMATION_CONFIG } from '@/constants/animations';

export interface BlinkSystem {
  startBlinking: () => void;
  stopBlinking: () => void;
  forceBlink: () => void;
}

export function useBlinkSystem(animateBlink: () => void): BlinkSystem {
  const blinkTimer = useRef<NodeJS.Timeout | null>(null);
  const isBlinking = useRef(false);

  const startBlinking = useCallback((): void => {
    if (isBlinking.current) return;
    
    isBlinking.current = true;
    
    const scheduleNextBlink = (): void => {
      const delay = Math.random() * 
        (ANIMATION_CONFIG.timing.blinkMaxInterval - ANIMATION_CONFIG.timing.blinkMinInterval) +
        ANIMATION_CONFIG.timing.blinkMinInterval;
        
      blinkTimer.current = setTimeout(() => {
        if (isBlinking.current) {
          animateBlink();
          scheduleNextBlink();
        }
      }, delay);
    };

    scheduleNextBlink();
  }, [animateBlink]);

  const stopBlinking = useCallback((): void => {
    isBlinking.current = false;
    if (blinkTimer.current) {
      clearTimeout(blinkTimer.current);
      blinkTimer.current = null;
    }
  }, []);

  const forceBlink = useCallback((): void => {
    animateBlink();
  }, [animateBlink]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopBlinking();
    };
  }, [stopBlinking]);

  // Auto-start blinking
  useEffect(() => {
    startBlinking();
  }, [startBlinking]);

  return {
    startBlinking,
    stopBlinking,
    forceBlink,
  };
}
