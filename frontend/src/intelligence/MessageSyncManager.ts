/**
 * MessageSyncManager - Core coordination system for Digital Humans
 * Manages message lifecycle: receive → plan → execute → cleanup
 * Ensures audio-animation synchronization and proper state management
 */

import { AnimationCoordinator } from './AnimationCoordinator';
import { SequencePlanner } from './SequencePlanner';
import { SequenceExecutor } from './SequenceExecutor';
import { IdleAnimationManager } from './IdleAnimationManager';
import { LipsyncCompatibleExpressionManager } from './LipsyncCompatibleExpressionManager';
import type { AvatarState, EmotionalIntent, LipsyncData, Message } from '@/types';

export interface MessageSyncState {
  messageId: string;
  phase: 'idle' | 'planning' | 'executing' | 'cleanup';
  startTime: number;
  plannedDuration: number;
  actualDuration?: number;
  animationSequence?: AnimationSequence;
  error?: string;
}

export interface AnimationSequence {
  animations: AnimationStep[];
  totalDuration: number;
  audioDuration: number;
  buffer: number;
}

export interface AnimationStep {
  animation: string;
  startTime: number;
  duration: number;
  crossfadeIn: number;
  crossfadeOut: number;
  expression?: string;
}

export interface MessageSyncCallbacks {
  onAnimationChange?: (animation: string) => void;
  onExpressionChange?: (expression: string) => void;
  onSequenceComplete?: () => void;
  onError?: (error: string) => void;
  onStateChange?: (state: MessageSyncState) => void;
}

export class MessageSyncManager {
  private sequencePlanner: SequencePlanner;
  private sequenceExecutor: SequenceExecutor;
  private idleManager: IdleAnimationManager;
  private expressionManager: LipsyncCompatibleExpressionManager;
  
  private currentState: MessageSyncState | null = null;
  private callbacks: MessageSyncCallbacks = {};
  private audioElement: HTMLAudioElement | null = null;
  private cleanupTasks: (() => void)[] = [];

  constructor(callbacks: MessageSyncCallbacks = {}) {
    this.callbacks = callbacks;
    
    // Initialize subsystems
    this.sequencePlanner = new SequencePlanner();
    this.sequenceExecutor = new SequenceExecutor({
      onAnimationChange: this.handleAnimationChange.bind(this),
      onSequenceComplete: this.handleSequenceComplete.bind(this),
      onError: this.handleSequenceError.bind(this)
    });
    
    this.idleManager = new IdleAnimationManager({
      onIdleAnimation: this.handleIdleAnimation.bind(this)
    });
    
    this.expressionManager = new LipsyncCompatibleExpressionManager({
      onExpressionChange: this.handleExpressionChange.bind(this)
    });

    console.log('🎯 MessageSyncManager initialized');
  }

  /**
   * Process a new message with audio and emotional intent
   */
  async processMessage(message: Message): Promise<void> {
    try {
      console.log('📨 Processing message:', message.text.substring(0, 50) + '...');
      
      // Stop idle animations
      this.idleManager.stop();
      
      // Extract audio duration
      const audioDuration = await this.extractAudioDuration(message);
      
      // Create message state
      const messageId = this.generateMessageId(message);
      this.currentState = {
        messageId,
        phase: 'planning',
        startTime: Date.now(),
        plannedDuration: audioDuration,
      };
      
      this.notifyStateChange();
      
      // Plan animation sequence
      const sequence = await this.planAnimationSequence(message, audioDuration);
      this.currentState.animationSequence = sequence;
      
      console.log('📋 Planned sequence:', {
        animations: sequence.animations.map(a => a.animation),
        totalDuration: sequence.totalDuration,
        audioDuration: sequence.audioDuration
      });
      
      // Setup expression management
      this.expressionManager.prepareForMessage(
        message.emotionalIntent,
        message.lipsync
      );
      
      // Execute sequence
      this.currentState.phase = 'executing';
      this.notifyStateChange();
      
      await this.executeSequence(sequence, message);
      
    } catch (error: any) {
      console.error('❌ Error processing message:', error);
      this.handleError(`Message processing failed: ${error.message}`);
    }
  }

  /**
   * Extract audio duration from message
   */
  private async extractAudioDuration(message: Message): Promise<number> {
    if (!message.audio) {
      console.log('⚠️ No audio in message, using text-based estimation');
      return this.estimateTextDuration(message.text);
    }

    return new Promise((resolve, reject) => {
      const audio = new Audio("data:audio/mp3;base64," + message.audio);
      
      audio.onloadedmetadata = () => {
        const duration = audio.duration;
        console.log(`🎵 Audio duration: ${duration.toFixed(2)}s`);
        resolve(duration);
      };
      
      audio.onerror = () => {
        console.warn('⚠️ Audio duration extraction failed, estimating from text');
        resolve(this.estimateTextDuration(message.text));
      };
      
      // Timeout fallback
      setTimeout(() => {
        console.warn('⚠️ Audio duration extraction timeout, estimating from text');
        resolve(this.estimateTextDuration(message.text));
      }, 1000);
    });
  }

  /**
   * Estimate duration based on text length (fallback)
   */
  private estimateTextDuration(text: string): number {
    // Average speaking rate: ~150 words per minute
    const wordsPerMinute = 150;
    const words = text.split(/\s+/).length;
    const estimatedMinutes = words / wordsPerMinute;
    const estimatedSeconds = estimatedMinutes * 60;
    
    // Add minimum duration and some buffer
    return Math.max(estimatedSeconds, 2.0) + 0.5;
  }

  /**
   * Plan animation sequence for the message
   */
  private async planAnimationSequence(message: Message, audioDuration: number): Promise<AnimationSequence> {
    const planningInput = {
      emotionalIntent: message.emotionalIntent,
      audioDuration: audioDuration,
      messageLength: message.text.length,
      context: this.extractMessageContext(message),
      metadata: message.metadata
    };

    return await this.sequencePlanner.planSequence(planningInput);
  }

  /**
   * Execute the planned sequence
   */
  private async executeSequence(sequence: AnimationSequence, message: Message): Promise<void> {
    // Setup audio
    if (message.audio) {
      await this.setupAudio(message.audio);
    }

    // Start sequence execution
    await this.sequenceExecutor.executeSequence(sequence);

    // Start audio playback (if available)
    if (this.audioElement) {
      try {
        await this.audioElement.play();
        console.log('🎵 Audio playback started');
      } catch (error) {
        console.error('❌ Audio playback failed:', error);
      }
    }

    // Start expression management (handles lipsync)
    if (message.lipsync && this.audioElement) {
      this.expressionManager.startLipsync(message.lipsync, this.audioElement);
    }
  }

  /**
   * Setup audio element with proper event handlers
   */
  private async setupAudio(audioBase64: string): Promise<void> {
    // Cleanup previous audio
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.src = '';
    }

    this.audioElement = new Audio("data:audio/mp3;base64," + audioBase64);

    return new Promise((resolve, reject) => {
      if (!this.audioElement) {
        reject(new Error('Audio element not created'));
        return;
      }

      this.audioElement.onloadeddata = () => {
        console.log('🎵 Audio loaded successfully');
        resolve();
      };

      this.audioElement.onended = () => {
        console.log('🎵 Audio ended');
        this.handleAudioComplete();
      };

      this.audioElement.onerror = (error) => {
        console.error('❌ Audio error:', error);
        reject(new Error('Audio loading failed'));
      };

      // Setup cleanup
      this.cleanupTasks.push(() => {
        if (this.audioElement) {
          this.audioElement.pause();
          this.audioElement.src = '';
        }
      });
    });
  }

  /**
   * Handle animation change from sequence executor
   */
  private handleAnimationChange(animation: string): void {
    console.log('🎬 Animation changed to:', animation);
    this.callbacks.onAnimationChange?.(animation);
  }

  /**
   * Handle expression change from expression manager
   */
  private handleExpressionChange(expression: string): void {
    console.log('😊 Expression changed to:', expression);
    this.callbacks.onExpressionChange?.(expression);
  }

  /**
   * Handle sequence completion
   */
  private handleSequenceComplete(): void {
    console.log('✅ Animation sequence completed');
    
    if (this.currentState) {
      this.currentState.phase = 'cleanup';
      this.currentState.actualDuration = Date.now() - this.currentState.startTime;
      this.notifyStateChange();
    }

    this.performCleanup();
    this.callbacks.onSequenceComplete?.();
    
    // Start idle animations
    setTimeout(() => {
      this.startIdleMode();
    }, 500);
  }

  /**
   * Handle audio completion
   */
  private handleAudioComplete(): void {
    console.log('🎵 Audio completed');
    // Audio completion is handled by sequence executor
    // This is just for logging and potential cleanup
  }

  /**
   * Handle idle animation requests
   */
  private handleIdleAnimation(animation: string): void {
    console.log('😴 Idle animation:', animation);
    this.callbacks.onAnimationChange?.(animation);
  }

  /**
   * Handle sequence errors
   */
  private handleSequenceError(error: string): void {
    this.handleError(`Sequence execution error: ${error}`);
  }

  /**
   * Handle errors
   */
  private handleError(error: string): void {
    console.error('❌ MessageSyncManager error:', error);
    
    if (this.currentState) {
      this.currentState.error = error;
      this.notifyStateChange();
    }

    this.callbacks.onError?.(error);
    this.performCleanup();
    
    // Fallback to idle mode
    setTimeout(() => {
      this.startIdleMode();
    }, 1000);
  }

  /**
   * Extract message context for planning
   */
  private extractMessageContext(message: Message): any {
    return {
      messageType: this.detectMessageType(message.text),
      relationshipTone: message.emotionalIntent?.context || 'casual',
      hasQuestion: message.text.includes('?'),
      hasExclamation: message.text.includes('!'),
      wordCount: message.text.split(/\s+/).length
    };
  }

  /**
   * Detect message type from text
   */
  private detectMessageType(text: string): string {
    const textLower = text.toLowerCase();
    
    if (textLower.includes('chào') || textLower.includes('hello') || textLower.includes('hi')) {
      return 'greeting';
    }
    if (textLower.includes('tạm biệt') || textLower.includes('bye') || textLower.includes('goodbye')) {
      return 'goodbye';
    }
    if (text.includes('?')) {
      return 'question';
    }
    if (textLower.includes('cảm ơn') || textLower.includes('thank')) {
      return 'gratitude';
    }
    
    return 'statement';
  }

  /**
   * Generate unique message ID
   */
  private generateMessageId(message: Message): string {
    const timestamp = Date.now();
    const textHash = message.text.substring(0, 10).replace(/\s/g, '');
    return `msg_${timestamp}_${textHash}`;
  }

  /**
   * Notify state change to callbacks
   */
  private notifyStateChange(): void {
    if (this.currentState) {
      this.callbacks.onStateChange?.(this.currentState);
    }
  }

  /**
   * Start idle mode
   */
  private startIdleMode(): void {
    console.log('😴 Starting idle mode');
    this.currentState = null;
    this.idleManager.start();
    
    // Set neutral expression
    this.expressionManager.setIdleExpression();
  }

  /**
   * Perform cleanup tasks
   */
  private performCleanup(): void {
    console.log('🧹 Performing cleanup');
    
    // Run all cleanup tasks
    this.cleanupTasks.forEach(task => {
      try {
        task();
      } catch (error) {
        console.error('❌ Cleanup task failed:', error);
      }
    });
    
    // Clear cleanup tasks
    this.cleanupTasks = [];
    
    // Stop subsystems
    this.sequenceExecutor.stop();
    this.expressionManager.stop();
  }

  /**
   * Get current state
   */
  getCurrentState(): MessageSyncState | null {
    return this.currentState;
  }

  /**
   * Check if currently processing a message
   */
  isProcessing(): boolean {
    return this.currentState !== null && this.currentState.phase !== 'idle';
  }

  /**
   * Force stop current processing
   */
  stop(): void {
    console.log('⏹️ Force stopping MessageSyncManager');
    
    if (this.currentState) {
      this.currentState.phase = 'cleanup';
      this.notifyStateChange();
    }
    
    this.performCleanup();
    this.startIdleMode();
  }

  /**
   * Cleanup on destruction
   */
  destroy(): void {
    console.log('💥 Destroying MessageSyncManager');
    this.stop();
    this.idleManager.destroy();
    this.sequenceExecutor.destroy();
    this.expressionManager.destroy();
  }
}

export default MessageSyncManager;
