/**
 * LipsyncCompatibleExpressionManager - Manages expressions that don't conflict with lipsync
 * Key Feature: Separates mouth-related morph targets from other facial expressions during speech
 */

import type { EmotionalIntent, LipsyncData } from '@/types';

export interface ExpressionManagerCallbacks {
  onExpressionChange?: (expression: string) => void;
  onMorphTargetUpdate?: (morphTargets: Record<string, number>) => void;
}

export interface ExpressionState {
  currentExpression: string;
  isLipsyncActive: boolean;
  activeMorphTargets: Record<string, number>;
  mouthMorphTargets: Record<string, number>;
  nonMouthMorphTargets: Record<string, number>;
}

export class LipsyncCompatibleExpressionManager {
  private callbacks: ExpressionManagerCallbacks;
  private state: ExpressionState = {
    currentExpression: 'default',
    isLipsyncActive: false,
    activeMorphTargets: {},
    mouthMorphTargets: {},
    nonMouthMorphTargets: {}
  };

  // Lipsync management
  private lipsyncData: LipsyncData | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private lipsyncInterval: NodeJS.Timeout | null = null;

  // Morph target classification
  private readonly MOUTH_MORPH_TARGETS = [
    'mouthSmile',
    'mouthFrown', 
    'mouthOpen',
    'mouthPucker',
    'mouthFunnel',
    'mouthDimple',
    'mouthStretch',
    'mouthRollLower',
    'mouthRollUpper',
    'mouthShrugLower',
    'mouthShrugUpper',
    'mouthLeft',
    'mouthRight',
    'mouthClose',
    'mouthPress',
    'viseme_A',
    'viseme_E',
    'viseme_I',
    'viseme_O',
    'viseme_U',
    'viseme_CH',
    'viseme_FF',
    'viseme_DD',
    'viseme_kk',
    'viseme_PP',
    'viseme_RR',
    'viseme_SS',
    'viseme_TH',
    'viseme_aa',
    'viseme_eh',
    'viseme_ih',
    'viseme_oh',
    'viseme_ou'
  ];

  // Expression to morph target mappings
  private readonly EXPRESSION_MAPPINGS: Record<string, Record<string, number>> = {
    default: {},
    smile: {
      mouthSmile: 0.7,
      eyeSquintLeft: 0.3,
      eyeSquintRight: 0.3,
      cheekPuff: 0.2
    },
    happy: {
      mouthSmile: 0.8,
      eyeSquintLeft: 0.4,
      eyeSquintRight: 0.4,
      cheekPuff: 0.3,
      browInnerUp: 0.2
    },
    excited: {
      mouthSmile: 0.9,
      eyeWideLeft: 0.6,
      eyeWideRight: 0.6,
      browInnerUp: 0.5,
      browOuterUpLeft: 0.4,
      browOuterUpRight: 0.4
    },
    sad: {
      mouthFrown: 0.8,
      browDownLeft: 0.6,
      browDownRight: 0.6,
      browInnerUp: 0.4,
      eyeSquintLeft: 0.2,
      eyeSquintRight: 0.2
    },
    surprised: {
      mouthOpen: 0.6,
      eyeWideLeft: 0.8,
      eyeWideRight: 0.8,
      browInnerUp: 0.7,
      browOuterUpLeft: 0.6,
      browOuterUpRight: 0.6
    },
    thoughtful: {
      browDownLeft: 0.3,
      browDownRight: 0.3,
      eyeSquintLeft: 0.2,
      eyeSquintRight: 0.2
    },
    serious: {
      browDownLeft: 0.4,
      browDownRight: 0.4,
      mouthPress: 0.3
    },
    romantic: {
      mouthSmile: 0.5,
      eyeSquintLeft: 0.3,
      eyeSquintRight: 0.3,
      browInnerUp: 0.2
    },
    playful: {
      mouthSmile: 0.6,
      eyeWinkLeft: 0.3,
      browOuterUpLeft: 0.3,
      cheekPuff: 0.2
    },
    mischievous: {
      mouthSmile: 0.7,
      eyeSquintLeft: 0.4,
      eyeSquintRight: 0.2,
      browOuterUpLeft: 0.3
    }
  };

  constructor(callbacks: ExpressionManagerCallbacks = {}) {
    this.callbacks = callbacks;
    this.classifyMorphTargets();
    console.log('😊 LipsyncCompatibleExpressionManager initialized');
  }

  /**
   * Prepare for incoming message with emotion and lipsync data
   */
  prepareForMessage(emotionalIntent: EmotionalIntent, lipsyncData?: LipsyncData): void {
    console.log('😊 Preparing for message:', {
      emotion: emotionalIntent.primary,
      intensity: emotionalIntent.intensity,
      hasLipsync: !!lipsyncData
    });

    // Set initial expression based on emotion
    const expression = this.mapEmotionToExpression(emotionalIntent);
    this.setExpression(expression, emotionalIntent.intensity);

    // Store lipsync data for later use
    this.lipsyncData = lipsyncData || null;
  }

  /**
   * Start lipsync with audio element
   */
  startLipsync(lipsyncData: LipsyncData, audioElement: HTMLAudioElement): void {
    console.log('😊 Starting lipsync');

    this.state.isLipsyncActive = true;
    this.lipsyncData = lipsyncData;
    this.audioElement = audioElement;

    // Separate mouth and non-mouth morph targets
    this.separateMorphTargets();

    // Start lipsync monitoring
    this.startLipsyncMonitoring();

    this.notifyStateChange();
  }

  /**
   * Stop lipsync and restore full expressions
   */
  stopLipsync(): void {
    console.log('😊 Stopping lipsync');

    this.state.isLipsyncActive = false;
    this.lipsyncData = null;
    this.audioElement = null;

    // Clear lipsync monitoring
    if (this.lipsyncInterval) {
      clearInterval(this.lipsyncInterval);
      this.lipsyncInterval = null;
    }

    // Restore full expression
    this.restoreFullExpression();

    this.notifyStateChange();
  }

  /**
   * Set facial expression
   */
  setExpression(expression: string, intensity: number = 1.0): void {
    console.log(`😊 Setting expression: ${expression} (intensity: ${intensity})`);

    this.state.currentExpression = expression;

    // Get expression morph targets
    const expressionTargets = this.getExpressionMorphTargets(expression, intensity);

    // Apply based on lipsync state
    if (this.state.isLipsyncActive) {
      // Only apply non-mouth targets during lipsync
      this.applyNonMouthTargets(expressionTargets);
    } else {
      // Apply all targets when not in lipsync
      this.applyAllTargets(expressionTargets);
    }

    this.callbacks.onExpressionChange?.(expression);
  }

  /**
   * Set idle expression (neutral state)
   */
  setIdleExpression(): void {
    this.setExpression('default', 1.0);
  }

  /**
   * Get expression morph targets with intensity scaling
   */
  private getExpressionMorphTargets(expression: string, intensity: number): Record<string, number> {
    const baseTargets = this.EXPRESSION_MAPPINGS[expression] || {};
    const scaledTargets: Record<string, number> = {};

    // Apply intensity scaling
    Object.entries(baseTargets).forEach(([target, value]) => {
      scaledTargets[target] = value * intensity;
    });

    return scaledTargets;
  }

  /**
   * Separate mouth and non-mouth morph targets
   */
  private separateMorphTargets(): void {
    this.state.mouthMorphTargets = {};
    this.state.nonMouthMorphTargets = {};

    Object.entries(this.state.activeMorphTargets).forEach(([target, value]) => {
      if (this.isMouthMorphTarget(target)) {
        this.state.mouthMorphTargets[target] = value;
      } else {
        this.state.nonMouthMorphTargets[target] = value;
      }
    });

    console.log('😊 Separated morph targets:', {
      mouth: Object.keys(this.state.mouthMorphTargets).length,
      nonMouth: Object.keys(this.state.nonMouthMorphTargets).length
    });
  }

  /**
   * Apply only non-mouth targets during lipsync
   */
  private applyNonMouthTargets(expressionTargets: Record<string, number>): void {
    // Filter out mouth targets
    const nonMouthTargets: Record<string, number> = {};
    
    Object.entries(expressionTargets).forEach(([target, value]) => {
      if (!this.isMouthMorphTarget(target)) {
        nonMouthTargets[target] = value;
      }
    });

    // Apply non-mouth targets
    this.state.nonMouthMorphTargets = nonMouthTargets;
    
    // Combine with current mouth targets (from lipsync)
    this.state.activeMorphTargets = {
      ...nonMouthTargets,
      ...this.state.mouthMorphTargets
    };

    this.notifyMorphTargetUpdate();
  }

  /**
   * Apply all targets when not in lipsync
   */
  private applyAllTargets(expressionTargets: Record<string, number>): void {
    this.state.activeMorphTargets = expressionTargets;
    this.notifyMorphTargetUpdate();
  }

  /**
   * Restore full expression after lipsync
   */
  private restoreFullExpression(): void {
    const currentExpression = this.state.currentExpression;
    const expressionTargets = this.getExpressionMorphTargets(currentExpression, 1.0);
    
    this.applyAllTargets(expressionTargets);
  }

  /**
   * Start lipsync monitoring
   */
  private startLipsyncMonitoring(): void {
    if (!this.audioElement || !this.lipsyncData) return;

    // Monitor lipsync every 50ms for smooth animation
    this.lipsyncInterval = setInterval(() => {
      this.updateLipsync();
    }, 50);
  }

  /**
   * Update lipsync morph targets
   */
  private updateLipsync(): void {
    if (!this.audioElement || !this.lipsyncData || !this.state.isLipsyncActive) return;

    const currentTime = this.audioElement.currentTime;
    const appliedMorphTargets: Record<string, number> = {};

    // Find active mouth cues
    for (const cue of this.lipsyncData.mouthCues) {
      if (currentTime >= cue.start && currentTime <= cue.end) {
        const progress = (currentTime - cue.start) / (cue.end - cue.start);
        const intensity = Math.sin(progress * Math.PI); // Smooth curve
        
        const morphTarget = this.mapVisemeToMorphTarget(cue.value);
        if (morphTarget) {
          appliedMorphTargets[morphTarget] = intensity;
        }
        break;
      }
    }

    // Update mouth morph targets
    this.state.mouthMorphTargets = appliedMorphTargets;

    // Combine with non-mouth targets
    this.state.activeMorphTargets = {
      ...this.state.nonMouthMorphTargets,
      ...appliedMorphTargets
    };

    this.notifyMorphTargetUpdate();
  }

  /**
   * Map viseme to morph target
   */
  private mapVisemeToMorphTarget(viseme: string): string | null {
    const visemeMapping: Record<string, string> = {
      'A': 'viseme_aa',
      'B': 'viseme_PP',
      'C': 'viseme_DD',
      'D': 'viseme_DD',
      'E': 'viseme_eh',
      'F': 'viseme_FF',
      'G': 'viseme_kk',
      'H': 'viseme_ih',
      'X': 'mouthClose'
    };

    return visemeMapping[viseme] || null;
  }

  /**
   * Check if morph target affects mouth
   */
  private isMouthMorphTarget(target: string): boolean {
    return this.MOUTH_MORPH_TARGETS.includes(target);
  }

  /**
   * Classify all morph targets
   */
  private classifyMorphTargets(): void {
    console.log(`😊 Classified ${this.MOUTH_MORPH_TARGETS.length} mouth morph targets`);
  }

  /**
   * Map emotion to appropriate expression
   */
  private mapEmotionToExpression(emotionalIntent: EmotionalIntent): string {
    const emotionMapping: Record<string, string> = {
      happy: 'happy',
      excited: 'excited',
      sad: 'sad',
      surprised: 'surprised',
      thoughtful: 'thoughtful',
      serious: 'serious',
      romantic: 'romantic',
      playful: 'playful',
      mischievous: 'mischievous'
    };

    return emotionMapping[emotionalIntent.primary] || 'default';
  }

  /**
   * Notify expression change
   */
  private notifyStateChange(): void {
    this.callbacks.onExpressionChange?.(this.state.currentExpression);
  }

  /**
   * Notify morph target update
   */
  private notifyMorphTargetUpdate(): void {
    this.callbacks.onMorphTargetUpdate?.(this.state.activeMorphTargets);
  }

  /**
   * Get current state
   */
  getState(): ExpressionState {
    return { ...this.state };
  }

  /**
   * Get available expressions
   */
  getAvailableExpressions(): string[] {
    return Object.keys(this.EXPRESSION_MAPPINGS);
  }

  /**
   * Get mouth morph targets
   */
  getMouthMorphTargets(): string[] {
    return [...this.MOUTH_MORPH_TARGETS];
  }

  /**
   * Check if currently in lipsync mode
   */
  isLipsyncActive(): boolean {
    return this.state.isLipsyncActive;
  }

  /**
   * Stop all expression management
   */
  stop(): void {
    this.stopLipsync();
    this.setIdleExpression();
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    console.log('💥 Destroying LipsyncCompatibleExpressionManager');
    this.stop();
    
    if (this.lipsyncInterval) {
      clearInterval(this.lipsyncInterval);
      this.lipsyncInterval = null;
    }
  }
}

export default LipsyncCompatibleExpressionManager;
