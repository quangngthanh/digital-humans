// Avatar configurations with CORRECT Ready Player Me morph targets URL format
export const DEFAULT_AVATARS = [
  {
    id: 'simple_avatar',
    name: '🎭 Simple Avatar (Always Works)',
    url: 'simple_avatar' // Special identifier for geometric avatar
  },
  {
    id: 'rpm_with_morphs_working_1',
    name: '👩 Emma (RPM + Full Morph Targets)',
    url: 'https://models.readyplayer.me/64bfa15f0e72c63d7c3934a6.glb?morphTargets=ARKit,Oculus+Visemes,mouthOpen,mouthSmile,eyesClosed,eyesLookUp,eyesLookDown&textureSizeLimit=1024&textureFormat=png'
  },
  {
    id: 'rpm_with_morphs_working_2',
    name: '👨 Alex (RPM + Full Morph Targets)', 
    url: 'https://models.readyplayer.me/65bd88929c897dc8b2c82ad0.glb?morphTargets=ARKit,Oculus+Visemes,mouthOpen,mouthSmile,eyesClosed,eyesLookUp,eyesLookDown&textureSizeLimit=1024&textureFormat=png'
  },
  {
    id: 'rpm_basic_morphs',
    name: '🎯 Basic Morph Targets (Testing)',
    url: 'https://models.readyplayer.me/6402c720bb5d09cfaa9b1c8c.glb?morphTargets=mouthOpen,mouthSmile,jawOpen&textureSizeLimit=1024'
  },
  {
    id: 'rpm_original_no_morphs',
    name: '❌ Original (No Morphs - for comparison)',
    url: 'https://models.readyplayer.me/68b66a6336d4d52aff79acb0.glb'
  }
];

// TTS Configuration
export const DEFAULT_TTS_CONFIG = {
  voice: 'en-US',
  rate: 1.0,
  pitch: 1.0,
  volume: 0.8
};

// Gemini API Configuration
export const GEMINI_CONFIG = {
  model: 'gemini-2.0-flash-exp',
  temperature: 0.7,
  maxTokens: 1024
};

// Audio Analysis Configuration
export const AUDIO_CONFIG = {
  fftSize: 256,
  smoothingTimeConstant: 0.8,
  minDecibels: -90,
  maxDecibels: -10
};

// Animation Configuration
export const ANIMATION_CONFIG = {
  lipSyncSensitivity: 2.0,
  idleAnimationSpeed: 0.5,
  transitionDuration: 0.3
};

// Environment Variables Keys
export const ENV_KEYS = {
  GEMINI_API_KEY: 'VITE_GEMINI_API_KEY'
} as const;

// Avatar loading states
export const AVATAR_STATES = {
  LOADING: 'loading',
  LOADED: 'loaded',
  ERROR: 'error'
} as const;

// Chat configuration
export const CHAT_CONFIG = {
  maxMessages: 50,
  typingDelay: 1000,
  maxResponseLength: 500
} as const;
