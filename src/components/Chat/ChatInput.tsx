import React, { useState } from 'react';
import { useChatStore } from '../../stores/chatStore';
import { useAvatarStore } from '../../stores/avatarStore';
import { geminiService } from '../../services/geminiService';
import { speechService } from '../../services/speechService';
import { lipSyncService } from '../../services/lipSyncService';
import { AudioData } from '../../types';

export function ChatInput() {
  const [input, setInput] = useState('');
  const { addMessage, setProcessing, isProcessing, messages, setError } = useChatStore();
  const { ttsConfig, setPlaying, setAudioData } = useAvatarStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message
    addMessage(userMessage, 'user');
    setProcessing(true);
    setError(null);

    try {
      // Generate AI response
      let response: string;
      
      try {
        const conversationHistory = messages.map(m => m.content);
        response = await geminiService.generateResponse(userMessage, conversationHistory);
      } catch (error) {
        console.warn('Using demo mode due to API error:', error);
        response = getDemoResponse(userMessage);
      }
      
      // Add AI message
      addMessage(response, 'assistant');

      // Start speech with lip sync
      if (speechService.isSupported()) {
        await startSpeechWithLipSync(response);
      } else {
        console.warn('Speech synthesis not supported');
      }
    } catch (error) {
      console.error('Chat error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setProcessing(false);
    }
  };

  /**
   * Start speech with synchronized lip sync
   */
  const startSpeechWithLipSync = async (text: string) => {
    console.log('🎯 Starting speech with lip sync for:', text.substring(0, 50) + '...');
    
    setPlaying(true);
    
    // Initialize lip sync service if needed
    try {
      if (!lipSyncService.isInitialized()) {
        await lipSyncService.initialize();
      }
    } catch (error) {
      console.warn('Lip sync service not available:', error);
    }

    // Start lip sync animation
    await startLipSyncAnimation(text);
  };

  /**
   * Start lip sync animation synchronized with speech
   */
  const startLipSyncAnimation = async (text: string) => {
    console.log('🎭 Starting lip sync animation');
    
    // Calculate speech timing
    const wordsPerMinute = 150; // Average speaking speed
    const wordCount = text.split(' ').length;
    const estimatedDuration = (wordCount / wordsPerMinute) * 60 * 1000; // in ms
    
    let elapsed = 0;
    let lipSyncInterval: number;
    const updateInterval = 16; // Update at ~60fps for smooth animation
    
    // Set up speech callbacks for synchronization
    speechService.setCallbacks(
      () => {
        console.log('🎯 Speech started - beginning lip sync animation');
      },
      () => {
        console.log('🔇 Speech ended - stopping lip sync animation');
        if (lipSyncInterval) clearInterval(lipSyncInterval);
        setAudioData({ volume: 0, frequency: [], timestamp: Date.now() });
        setPlaying(false);
      }
    );
    
    // Start the lip sync animation
    lipSyncInterval = setInterval(() => {
      elapsed += updateInterval;
      const progress = elapsed / estimatedDuration;
      
      if (!speechService.isSpeaking() || progress >= 1.2) {
        // Speech ended or timeout - stop animation
        setAudioData({ volume: 0, frequency: [], timestamp: Date.now() });
        clearInterval(lipSyncInterval);
        setPlaying(false);
        console.log('🔇 Lip sync animation stopped');
        return;
      }
      
      // Generate realistic speech pattern using lip sync service
      const audioData = lipSyncService.generateAudioFromText(text);
      
      // Adjust volume based on speech progress
      const adjustedVolume = audioData.volume * generateSpeechEnvelope(progress);
      const finalAudioData: AudioData = {
        ...audioData,
        volume: adjustedVolume
      };
      
      setAudioData(finalAudioData);
    }, updateInterval);

    // Start speaking
    try {
      await speechService.speak(text, ttsConfig);
    } catch (error) {
      if (lipSyncInterval) clearInterval(lipSyncInterval);
      setPlaying(false);
      throw error;
    }
  };

  /**
   * Generate speech envelope for natural volume variation
   */
  const generateSpeechEnvelope = (progress: number): number => {
    // Create natural speech pattern with buildup, sustain, and decay
    if (progress < 0.1) {
      // Buildup phase
      return progress / 0.1;
    } else if (progress < 0.9) {
      // Sustain phase with slight variation
      return 0.8 + Math.sin(progress * Math.PI * 4) * 0.1;
    } else {
      // Decay phase
      return (1 - progress) / 0.1;
    }
  };

  // Demo responses for testing without API key
  const getDemoResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "Hello! I'm your AI avatar. It's great to meet you! I can help you with various tasks and have conversations. How can I assist you today?";
    } else if (lowerMessage.includes('how are you')) {
      return "I'm doing wonderfully! Thank you for asking. I'm excited to interact with you and demonstrate my capabilities. I can speak, express emotions, and even sync my lips with my speech!";
    } else if (lowerMessage.includes('what can you do')) {
      return "I'm a digital human with many amazing abilities! I can have natural conversations, express emotions through facial expressions, sync my lips with speech in real-time, and respond to your voice commands. I'm here to make our interaction as human-like as possible!";
    } else if (lowerMessage.includes('emotion') || lowerMessage.includes('expression')) {
      return "Yes! I can show various facial expressions and emotions. Watch how my face changes as I speak - you'll see my mouth move, my eyes express emotion, and my overall facial features respond to the conversation. It's like talking to a real person!";
    } else if (lowerMessage.includes('lip sync')) {
      return "Absolutely! My lip sync technology is one of my coolest features. As I speak, my mouth movements perfectly match the audio, creating a realistic talking avatar experience. You can see this in action right now as I'm speaking to you!";
    } else if (lowerMessage.includes('test') || lowerMessage.includes('demo')) {
      return "Perfect! This is a great way to test my capabilities. I'm currently demonstrating my speech synthesis, facial expressions, and lip sync technology. Notice how my mouth moves naturally with my words and how I can express different emotions!";
    } else {
      return "That's an interesting question! I'm here to help and demonstrate my capabilities as an AI avatar. I can engage in conversations, show emotions, and provide assistance. What would you like to know more about?";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message..."
        className="chat-input flex-1 text-sm py-2"
        disabled={isProcessing}
      />
      <button
        type="submit"
        disabled={!input.trim() || isProcessing}
        className="chat-button text-xs py-2 px-4"
      >
        {isProcessing ? 'Thinking...' : 'Send'}
      </button>
    </form>
  );
}
