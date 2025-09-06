// Expression Groups mapped by emotional intent
export interface ExpressionGroup {
  category: 'basic' | 'complex' | 'social' | 'cognitive' | 'micro';
  intensityLevels: {
    low: string[];
    medium: string[];
    high: string[];
  };
  contextualVariants: {
    [context: string]: string[];
  };
  animationCompatibility: string[];
}

export const EMOTION_GROUPS: Record<string, ExpressionGroup> = {
  // === BASIC EMOTIONS ===
  happy: {
    category: 'basic',
    intensityLevels: {
      low: ['smile', 'content'],
      medium: ['joy', 'cheerful'],
      high: ['euphoric', 'laughing']
    },
    contextualVariants: {
      romantic: ['flirtatious', 'loving'],
      playful: ['mischievous', 'cheeky'],
      casual: ['smile', 'welcoming'],
      flirting: ['flirtatious', 'playful']
    },
    animationCompatibility: ['Talking_1', 'Talking_2', 'Laughing']
  },

  sad: {
    category: 'basic',
    intensityLevels: {
      low: ['melancholy', 'uncomfortable'],
      medium: ['sad', 'worried'],
      high: ['crying', 'devastated']
    },
    contextualVariants: {
      comfort: ['pleading', 'ashamed'],
      casual: ['sad', 'melancholy'],
      serious: ['worried', 'concerned']
    },
    animationCompatibility: ['Talking_0', 'Crying', 'Idle']
  },

  excited: {
    category: 'basic',
    intensityLevels: {
      low: ['alert', 'curious'],
      medium: ['excited', 'surprised'],
      high: ['euphoric', 'overwhelmed']
    },
    contextualVariants: {
      playful: ['excited', 'mischievous'],
      romantic: ['excited', 'flirtatious'],
      casual: ['alert', 'curious']
    },
    animationCompatibility: ['Talking_2', 'Laughing', 'Rumba']
  },

  surprised: {
    category: 'basic',
    intensityLevels: {
      low: ['alert', 'curious'],
      medium: ['surprised', 'enlightened'],
      high: ['terrified', 'overwhelmed']
    },
    contextualVariants: {
      positive: ['enlightened', 'amazed'],
      negative: ['terrified', 'shocked'],
      neutral: ['surprised', 'alert']
    },
    animationCompatibility: ['Talking_1', 'Terrified', 'Idle']
  },

  frustrated: {
    category: 'basic',
    intensityLevels: {
      low: ['annoyed', 'unimpressed'],
      medium: ['frustrated', 'skeptical'],
      high: ['angry', 'defiant']
    },
    contextualVariants: {
      serious: ['determined', 'focused'],
      casual: ['annoyed', 'skeptical']
    },
    animationCompatibility: ['Talking_0', 'Angry', 'Idle']
  },

  confused: {
    category: 'basic',
    intensityLevels: {
      low: ['puzzled', 'thoughtful'],
      medium: ['confused', 'skeptical'],
      high: ['overwhelmed', 'dizzy']
    },
    contextualVariants: {
      question: ['curious', 'puzzled'],
      casual: ['confused', 'thoughtful']
    },
    animationCompatibility: ['Talking_0', 'Talking_1', 'Idle']
  },

  // === RELATIONSHIP EMOTIONS ===
  romantic: {
    category: 'social',
    intensityLevels: {
      low: ['shy', 'content'],
      medium: ['flirtatious', 'loving'],
      high: ['passionate', 'euphoric']
    },
    contextualVariants: {
      flirting: ['flirtatious', 'mischievous'],
      greeting: ['welcoming', 'shy'],
      compliment: ['embarrassed', 'flirtatious']
    },
    animationCompatibility: ['Talking_1', 'Talking_2', 'Rumba']
  },

  caring: {
    category: 'social',
    intensityLevels: {
      low: ['content', 'welcoming'],
      medium: ['caring', 'peaceful'],
      high: ['devoted', 'protective']
    },
    contextualVariants: {
      comfort: ['caring', 'supportive'],
      greeting: ['welcoming', 'warm'],
      casual: ['content', 'peaceful']
    },
    animationCompatibility: ['Talking_1', 'Talking_0', 'Idle']
  },

  playful: {
    category: 'social',
    intensityLevels: {
      low: ['cheeky', 'smirk'],
      medium: ['playful', 'mischievous'],
      high: ['goofy', 'crazy']
    },
    contextualVariants: {
      flirting: ['mischievous', 'cheeky'],
      casual: ['playful', 'goofy'],
      joke: ['laughing', 'crazy']
    },
    animationCompatibility: ['Talking_2', 'Laughing', 'Rumba']
  },

  mischievous: {
    category: 'social',
    intensityLevels: {
      low: ['smirk', 'cheeky'],
      medium: ['mischievous', 'sly'],
      high: ['devious', 'wicked']
    },
    contextualVariants: {
      playful: ['cheeky', 'goofy'],
      flirting: ['mischievous', 'sly'],
      teasing: ['smirk', 'devious']
    },
    animationCompatibility: ['Talking_1', 'Talking_2', 'Rumba']
  },

  shy: {
    category: 'social',
    intensityLevels: {
      low: ['content', 'peaceful'],
      medium: ['shy', 'embarrassed'],
      high: ['bashful', 'flustered']
    },
    contextualVariants: {
      romantic: ['shy', 'bashful'],
      compliment: ['embarrassed', 'flustered'],
      casual: ['content', 'peaceful']
    },
    animationCompatibility: ['Talking_0', 'Talking_1', 'Idle']
  },

  confident: {
    category: 'social',
    intensityLevels: {
      low: ['content', 'cool'],
      medium: ['confident', 'proud'],
      high: ['dominant', 'triumphant']
    },
    contextualVariants: {
      flirting: ['confident', 'cool'],
      achievement: ['proud', 'triumphant'],
      casual: ['content', 'relaxed']
    },
    animationCompatibility: ['Talking_1', 'Talking_2', 'Idle']
  },

  // === COGNITIVE STATES ===
  thoughtful: {
    category: 'cognitive',
    intensityLevels: {
      low: ['contemplating', 'peaceful'],
      medium: ['thoughtful', 'focused'],
      high: ['deep_thought', 'philosophical']
    },
    contextualVariants: {
      question: ['thinking', 'contemplating'],
      serious: ['focused', 'determined'],
      casual: ['thoughtful', 'peaceful']
    },
    animationCompatibility: ['Talking_0', 'Idle', 'Thinking']
  },

  curious: {
    category: 'cognitive',
    intensityLevels: {
      low: ['interested', 'alert'],
      medium: ['curious', 'inquisitive'],
      high: ['fascinated', 'obsessed']
    },
    contextualVariants: {
      question: ['curious', 'inquisitive'],
      discovery: ['enlightened', 'fascinated'],
      casual: ['interested', 'alert']
    },
    animationCompatibility: ['Talking_1', 'Talking_2', 'Idle']
  },

  serious: {
    category: 'cognitive',
    intensityLevels: {
      low: ['focused', 'attentive'],
      medium: ['serious', 'determined'],
      high: ['intense', 'grave']
    },
    contextualVariants: {
      problem: ['concerned', 'worried'],
      discussion: ['serious', 'focused'],
      decision: ['determined', 'resolute']
    },
    animationCompatibility: ['Talking_0', 'Talking_1', 'Idle']
  }
};

// Animation Groups
export const ANIMATION_GROUPS: Record<string, Record<string, string[]>> = {
  conversation: {
    casual: ['Talking_0', 'Talking_1'],
    animated: ['Talking_2'],
    calm: ['Idle']
  },
  emotional: {
    positive: ['Laughing', 'Rumba'],
    negative: ['Crying'],
    intense: ['Angry', 'Terrified']
  },
  social: {
    flirty: ['Talking_2', 'Rumba'],
    caring: ['Talking_1', 'Idle'],
    playful: ['Talking_2', 'Laughing', 'Rumba']
  },
  cognitive: {
    thinking: ['Idle', 'Talking_0'],
    focused: ['Talking_1'],
    explaining: ['Talking_2']
  }
};
