import { TTSConfig } from '../types';

class SpeechService {
  private synth: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private onSpeechStart?: () => void;
  private onSpeechEnd?: () => void;

  constructor() {
    this.synth = window.speechSynthesis;
    this.loadVoices();
    
    // Load voices when they become available
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = () => this.loadVoices();
    }
  }

  private loadVoices() {
    this.voices = this.synth.getVoices();
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.voices.filter(voice => voice.lang.includes('en'));
  }

  /**
   * **ENHANCED**: Speak with better event handling and callbacks
   */
  async speak(text: string, config: TTSConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synth) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      // Stop any current speech
      this.stop();

      // **FIX**: Wait a bit before starting new speech to avoid "interrupted" error
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        this.currentUtterance = utterance;

        // Find voice
        const voice = this.voices.find(v => v.name === config.voice) 
                   || this.voices.find(v => v.lang === config.voice)
                   || this.voices.find(v => v.lang.includes('en-US'))
                   || this.voices[0];

        if (voice) {
          utterance.voice = voice;
        }

        utterance.rate = Math.max(0.1, Math.min(10, config.rate)); // Clamp rate
        utterance.pitch = Math.max(0, Math.min(2, config.pitch)); // Clamp pitch
        utterance.volume = Math.max(0, Math.min(1, config.volume)); // Clamp volume

        // **ENHANCED**: Robust event handling
        utterance.onstart = () => {
          console.log('🔊 Speech started successfully');
          if (this.onSpeechStart) {
            this.onSpeechStart();
          }
        };

        utterance.onend = () => {
          console.log('🔇 Speech completed successfully');
          this.currentUtterance = null;
          if (this.onSpeechEnd) {
            this.onSpeechEnd();
          }
          resolve();
        };

        utterance.onerror = (event) => {
          console.error('❌ Speech error:', event.error);
          
          // **FIX**: Handle different error types
          if (event.error === 'interrupted') {
            console.warn('Speech was interrupted, but this might be normal behavior');
            resolve(); // Don't treat interruption as a failure
          } else {
            this.currentUtterance = null;
            reject(new Error(`Speech synthesis error: ${event.error}`));
          }
        };

        console.log('🎯 Starting speech synthesis:', {
          text: text.substring(0, 50) + '...',
          voice: voice?.name || 'default',
          rate: config.rate,
          pitch: config.pitch,
          volume: config.volume
        });

        try {
          this.synth.speak(utterance);
        } catch (error) {
          console.error('Failed to start speech:', error);
          reject(error);
        }
      }, 100); // Small delay to prevent conflicts
    });
  }

  /**
   * **NEW**: Set callbacks for speech events
   */
  setCallbacks(onStart?: () => void, onEnd?: () => void) {
    this.onSpeechStart = onStart;
    this.onSpeechEnd = onEnd;
  }

  stop() {
    if (this.synth.speaking) {
      this.synth.cancel();
    }
    this.currentUtterance = null;
  }

  isSpeaking(): boolean {
    return this.synth.speaking;
  }

  isSupported(): boolean {
    return 'speechSynthesis' in window;
  }

  getCurrentUtterance(): SpeechSynthesisUtterance | null {
    return this.currentUtterance;
  }

  pause() {
    if (this.synth.speaking) {
      this.synth.pause();
    }
  }

  resume() {
    if (this.synth.paused) {
      this.synth.resume();
    }
  }
}

export const speechService = new SpeechService();
