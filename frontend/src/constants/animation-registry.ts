/**
 * Animation Registry - Comprehensive animation metadata and classification system
 * Auto-generated from animation metadata extraction + manual enhancements
 */

export interface AnimationMetadata {
  file: string;
  duration: number;
  hasAnimation: boolean;
  tracks: number;
  classification: AnimationClassification;
  extractedAt?: string;
  error?: string;
}

export interface AnimationClassification {
  category: 'conversation' | 'emotional' | 'social' | 'idle' | 'cognitive' | 'movement' | 'other';
  usage: 'speaking' | 'reaction' | 'expressive' | 'idle' | 'locomotion' | 'general';
  intensity: 'low' | 'medium' | 'high';
  durationClass: 'short' | 'medium' | 'long';
  emotionCompatibility: string[];
  sequenceCompatible: boolean;
  loopable: boolean;
}

export interface AnimationGroup {
  name: string;
  animations: string[];
  category: string;
  description: string;
  usage: string[];
  averageDuration: number;
}

export interface SequenceRule {
  name: string;
  pattern: string[];
  totalDuration: number;
  description: string;
  compatibility: string[];
}

// Animation Groups for easy selection
export const ANIMATION_GROUPS: Record<string, AnimationGroup> = {
  // Conversation animations for speaking
  conversation: {
    name: 'conversation',
    animations: ['Talking_0', 'Talking_1', 'Talking_2', 'Sitting Talking', 'Telling A Secret'],
    category: 'conversation',
    description: 'Animations suitable for speaking and conversation',
    usage: ['speaking', 'dialogue', 'storytelling'],
    averageDuration: 3.5
  },

  // Emotional reactions
  emotional_positive: {
    name: 'emotional_positive',
    animations: ['Laughing', 'Thankful'],
    category: 'emotional',
    description: 'Positive emotional expressions',
    usage: ['happy_reaction', 'gratitude', 'joy'],
    averageDuration: 4.0
  },

  emotional_negative: {
    name: 'emotional_negative',
    animations: ['Crying', 'Terrified'],
    category: 'emotional',
    description: 'Negative emotional expressions',
    usage: ['sad_reaction', 'fear', 'distress'],
    averageDuration: 5.0
  },

  // Social and expressive
  social_playful: {
    name: 'social_playful',
    animations: ['Hip Hop Dancing', 'Chicken Dance'],
    category: 'social',
    description: 'Playful and energetic social animations',
    usage: ['celebration', 'fun', 'playful'],
    averageDuration: 8.0
  },

  social_romantic: {
    name: 'social_romantic',
    animations: ['Rumba Dancing'],
    category: 'social',
    description: 'Romantic and intimate animations',
    usage: ['romance', 'intimate', 'dancing'],
    averageDuration: 10.0
  },

  // Idle and cognitive
  idle_basic: {
    name: 'idle_basic',
    animations: ['Standing Idle'],
    category: 'idle',
    description: 'Basic idle animations for default state',
    usage: ['waiting', 'default', 'neutral'],
    averageDuration: 2.0
  },

  cognitive: {
    name: 'cognitive',
    animations: ['Looking', 'Thinking'],
    category: 'cognitive',
    description: 'Thoughtful and cognitive animations',
    usage: ['thinking', 'contemplating', 'curious'],
    averageDuration: 4.0
  },

  // Movement (for future use)
  movement: {
    name: 'movement',
    animations: ['Walking', 'Start Walking', 'Stop Walking', 'Walking Turn 180', 'Walk In Circle', 'Female Start Walking', 'Female Stop Walking', 'Female Stop And Start Walking'],
    category: 'movement',
    description: 'Movement and locomotion animations',
    usage: ['walking', 'movement', 'transition'],
    averageDuration: 3.0
  }
};

// Sequence patterns for different audio durations
export const SEQUENCE_PATTERNS: Record<string, SequenceRule[]> = {
  short: [
    {
      name: 'single_conversation',
      pattern: ['Talking_0'],
      totalDuration: 3.0,
      description: 'Single conversation animation for short audio',
      compatibility: ['all']
    }
  ],

  medium: [
    {
      name: 'conversation_transition',
      pattern: ['Talking_1', 'Talking_2'],
      totalDuration: 6.0,
      description: 'Two conversation animations with transition',
      compatibility: ['neutral', 'happy', 'thoughtful']
    },
    {
      name: 'emotional_conversation',
      pattern: ['Laughing', 'Talking_1'],
      totalDuration: 7.0,
      description: 'Emotional reaction followed by conversation',
      compatibility: ['happy', 'excited']
    }
  ],

  long: [
    {
      name: 'full_sequence',
      pattern: ['Talking_0', 'Talking_1', 'Talking_2'],
      totalDuration: 9.0,
      description: 'Full conversation sequence for long audio',
      compatibility: ['storytelling', 'explanation']
    },
    {
      name: 'social_conversation',
      pattern: ['Hip Hop Dancing', 'Talking_2'],
      totalDuration: 11.0,
      description: 'Social animation followed by conversation',
      compatibility: ['playful', 'excited', 'confident']
    }
  ]
};

// Emotion to animation group mapping
export const EMOTION_ANIMATION_MAPPING: Record<string, string[]> = {
  happy: ['conversation', 'emotional_positive', 'social_playful'],
  excited: ['emotional_positive', 'social_playful', 'conversation'],
  playful: ['social_playful', 'conversation', 'emotional_positive'],
  romantic: ['social_romantic', 'conversation'],
  sad: ['emotional_negative', 'conversation'],
  frustrated: ['emotional_negative', 'conversation'],
  surprised: ['emotional_negative', 'conversation'],
  confused: ['cognitive', 'conversation'],
  thoughtful: ['cognitive', 'conversation'],
  serious: ['conversation', 'cognitive'],
  caring: ['conversation', 'emotional_positive'],
  confident: ['social_playful', 'conversation'],
  shy: ['conversation', 'idle_basic'],
  curious: ['cognitive', 'conversation'],
  mischievous: ['social_playful', 'conversation'],
  default: ['idle_basic', 'conversation']
};

// Idle animation scheduling rules
export const IDLE_ANIMATION_RULES = {
  // Base intervals for idle animations (in seconds)
  intervals: {
    min: 3,
    max: 8,
    thoughtful: 5, // When in thoughtful mood, wait longer
    playful: 3     // When playful, be more active
  },

  // Emotion-based idle animation selection
  emotionToIdle: {
    default: ['Standing Idle'],
    thoughtful: ['Thinking', 'Standing Idle'],
    curious: ['Looking', 'Thinking'],
    happy: ['Standing Idle'],
    playful: ['Standing Idle', 'Looking'],
    serious: ['Standing Idle', 'Thinking']
  },

  // Prevent repetition rules
  repetitionPrevention: {
    maxConsecutive: 2, // Max same animation in a row
    historySize: 5     // Remember last N animations
  }
};

// Duration calculation helpers
export const DURATION_HELPERS = {
  // Buffer percentage to add to audio duration
  audioBuffer: 0.1, // 10% buffer

  // Minimum durations for different scenarios
  minimums: {
    singleAnimation: 2.0,
    sequenceTransition: 0.5,
    idleAnimation: 1.5
  },

  // Crossfade durations
  crossfades: {
    conversation: 0.3,
    emotional: 0.5,
    social: 0.8,
    idle: 0.2
  }
};

// Animation priority rules for selection
export const ANIMATION_PRIORITIES = {
  // Higher number = higher priority
  conversation: 10,
  emotional_match: 15,
  context_match: 12,
  intensity_match: 8,
  duration_match: 5,
  fallback: 1
};

export default {
  ANIMATION_GROUPS,
  SEQUENCE_PATTERNS,
  EMOTION_ANIMATION_MAPPING,
  IDLE_ANIMATION_RULES,
  DURATION_HELPERS,
  ANIMATION_PRIORITIES
};
