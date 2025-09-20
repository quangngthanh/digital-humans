// Animation configurations
export const ANIMATION_CONFIG = {
  // Idle animations with loop configurations
  idleAnimations: [
    { name: 'BreathingIdle', loop: 8 }, 
    { name: 'Looking', loop: 3 }, 
  ],
  
  // Default idle animation (played during delay periods)
  defaultIdleAnimation: 'Idle',
  
  // Talking animations (used during speech)
  talkingAnimations: [
    'Talking_0',
    'Talking_1', 
    'Talking_2',
  ],
  
  // Emotional animations (will be expanded as more GLB files are added)
  emotionalAnimations: {
    happy: ['Talking_1'],
    sad: ['Talking_0', 'Thinking', 'SadIdle'],
    excited: ['Talking_1'],
    thinking: ['Thinking'],
    default: ['Talking_1'],
  },
  
  // Animation timing settings
  timing: {
    idleMinDuration: 3000,   // Min time before switching idle animation
    idleMaxDuration: 8000,   // Max time before switching idle animation
    blinkMinInterval: 1000,  // Min time between blinks
    blinkMaxInterval: 8000,  // Max time between blinks
    transitionDuration: 0.8, // Animation transition duration
  }
} as const;

export type AnimationName = string;
export type EmotionType = keyof typeof ANIMATION_CONFIG.emotionalAnimations;

// Types for idle animation configuration
export type IdleAnimationConfig = {
  name: AnimationName;
  loop: boolean | number; // true = infinite, number = specific count
};

export type AnimationConfig = typeof ANIMATION_CONFIG;

