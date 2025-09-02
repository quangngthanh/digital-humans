import { AudioData } from '../types';

class LipSyncService {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  private isListening = false;
  private onAudioData?: (data: AudioData) => void;

  async initialize(): Promise<void> {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      
      // Configure analyzer for speech frequencies
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;
      this.analyser.minDecibels = -90;
      this.analyser.maxDecibels = -10;
      
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    } catch (error) {
      console.error('Failed to initialize lip sync service:', error);
      throw error;
    }
  }

  /**
   * Connect to speech synthesis audio output
   */
  connectToSpeechSynthesis(): void {
    if (!this.audioContext || !this.analyser) {
      console.warn('Lip sync service not initialized');
      return;
    }

    // Create a MediaStreamDestination to capture speech synthesis
    const destination = this.audioContext.createMediaStreamDestination();
    
    // Create an oscillator to simulate speech (since we can't directly access TTS audio)
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.analyser);
    gainNode.connect(destination);
    
    // Start the oscillator
    oscillator.start();
    
    // Simulate speech patterns
    this.simulateSpeechPattern();
  }

  /**
   * Simulate realistic speech patterns for lip sync
   */
  private simulateSpeechPattern(): void {
    if (!this.isListening) return;

    // Create a realistic speech envelope
    const speechPattern = this.generateSpeechEnvelope();
    let patternIndex = 0;

    const updateVolume = () => {
      if (!this.isListening || !this.analyser || !this.dataArray) return;

      if (patternIndex < speechPattern.length) {
        const volume = speechPattern[patternIndex];
        
        // Update analyzer data to simulate speech
        this.dataArray.fill(Math.floor(volume * 255));
        this.analyser.getByteFrequencyData(this.dataArray);
        
        // Calculate volume from frequency data
        let sum = 0;
        for (let i = 0; i < this.dataArray.length; i++) {
          sum += this.dataArray[i] * this.dataArray[i];
        }
        const calculatedVolume = Math.sqrt(sum / this.dataArray.length) / 255;
        
        // Create audio data for avatar
        const audioData: AudioData = {
          volume: calculatedVolume,
          frequency: Array.from(this.dataArray).map(value => value / 255),
          timestamp: Date.now()
        };
        
        if (this.onAudioData) {
          this.onAudioData(audioData);
        }
        
        patternIndex++;
      } else {
        // Reset pattern for continuous loop
        patternIndex = 0;
      }
    };

    // Update at 60fps for smooth lip sync
    const interval = setInterval(() => {
      if (!this.isListening) {
        clearInterval(interval);
        return;
      }
      updateVolume();
    }, 16); // ~60fps
  }

  /**
   * Generate realistic speech envelope
   */
  private generateSpeechEnvelope(): number[] {
    const pattern: number[] = [];
    
    // Simulate word patterns
    for (let word = 0; word < 5; word++) {
      // Word buildup (quick rise)
      for (let i = 0; i < 10; i++) {
        pattern.push(0.1 + (i / 10) * 0.6);
      }
      
      // Word sustain (hold)
      for (let i = 0; i < 15; i++) {
        pattern.push(0.7 + Math.random() * 0.2);
      }
      
      // Word decay (slow fall)
      for (let i = 0; i < 12; i++) {
        pattern.push(0.7 * (1 - i / 12) + Math.random() * 0.1);
      }
      
      // Pause between words
      for (let i = 0; i < 8; i++) {
        pattern.push(0.05 + Math.random() * 0.05);
      }
    }
    
    return pattern;
  }

  /**
   * Start lip sync monitoring
   */
  start(): void {
    if (!this.audioContext || !this.analyser) {
      console.warn('Lip sync service not initialized');
      return;
    }
    
    this.isListening = true;
    this.connectToSpeechSynthesis();
  }

  /**
   * Stop lip sync monitoring
   */
  stop(): void {
    this.isListening = false;
  }

  /**
   * Set callback for audio data updates
   */
  onAudioUpdate(callback: (data: AudioData) => void): void {
    this.onAudioData = callback;
  }

  /**
   * Generate audio data from text for testing
   */
  generateAudioFromText(text: string): AudioData {
    const words = text.split(' ');
    const volume = Math.min(0.8, 0.2 + (words.length * 0.1));
    
    // Create frequency spectrum that mimics speech
    const frequencies = new Array(128).fill(0).map((_, index) => {
      const frequencyPosition = index / 128;
      let amplitude = 0;
      
      if (frequencyPosition < 0.3) {
        // Lower frequencies (fundamental speech)
        amplitude = volume * (0.8 + Math.random() * 0.4) * (1 - frequencyPosition);
      } else if (frequencyPosition < 0.6) {
        // Mid frequencies (formants)
        amplitude = volume * (0.4 + Math.random() * 0.3) * Math.sin(frequencyPosition * Math.PI);
      } else {
        // Higher frequencies (consonants)
        amplitude = volume * (0.1 + Math.random() * 0.2) * Math.exp(-frequencyPosition * 2);
      }
      
      return Math.max(0, Math.min(1, amplitude));
    });
    
    return {
      volume,
      frequency: frequencies,
      timestamp: Date.now()
    };
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    this.stop();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.analyser = null;
    this.dataArray = null;
  }

  isInitialized(): boolean {
    return !!this.audioContext && !!this.analyser;
  }
}

export const lipSyncService = new LipSyncService();
