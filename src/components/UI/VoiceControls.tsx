import { useState, useEffect } from 'react';
import { useAvatarStore } from '../../stores/avatarStore';
import { speechService } from '../../services/speechService';
import { lipSyncService } from '../../services/lipSyncService';

export function VoiceControls() {
  const { ttsConfig, setTtsConfig, isPlaying, setAudioData, setPlaying } = useAvatarStore();
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLipSyncEnabled, setIsLipSyncEnabled] = useState(false);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = speechService.getAvailableVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    
    // Voices might load asynchronously
    const interval = setInterval(() => {
      const availableVoices = speechService.getAvailableVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
        clearInterval(interval);
      }
    }, 100);

    // Initialize lip sync service
    const initLipSync = async () => {
      try {
        await lipSyncService.initialize();
        console.log('Lip sync service initialized');
      } catch (error) {
        console.error('Failed to initialize lip sync service:', error);
      }
    };

    initLipSync();

    return () => {
      clearInterval(interval);
      lipSyncService.dispose();
    };
  }, []);

  // Set up lip sync callback
  useEffect(() => {
    lipSyncService.onAudioUpdate((audioData) => {
      setAudioData(audioData);
    });
  }, [setAudioData]);

  const handleStopSpeaking = () => {
    speechService.stop();
    lipSyncService.stop();
    setPlaying(false);
    setAudioData(null);
  };

  const handleTestVoice = async () => {
    try {
      setPlaying(true);
      
      // Start lip sync if enabled
      if (isLipSyncEnabled) {
        lipSyncService.start();
      }
      
      await speechService.speak('Hello! This is how I sound. I can speak with realistic lip sync animation.', ttsConfig);
      
      // Stop lip sync after speech
      if (isLipSyncEnabled) {
        lipSyncService.stop();
        setAudioData(null);
      }
      
      setPlaying(false);
    } catch (error) {
      console.error('Test voice failed:', error);
      setPlaying(false);
      lipSyncService.stop();
      setAudioData(null);
    }
  };

  const handleToggleLipSync = () => {
    setIsLipSyncEnabled(!isLipSyncEnabled);
    if (!isLipSyncEnabled) {
      lipSyncService.start();
    } else {
      lipSyncService.stop();
      setAudioData(null);
    }
  };

  if (!speechService.isSupported()) {
    return (
      <div className="p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
        <p className="text-yellow-400 text-sm">⚠️ Speech synthesis not supported in this browser</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-300">Voice Controls</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
        >
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>

      {/* Lip Sync Toggle */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-300">Lip Sync</span>
        <button
          onClick={handleToggleLipSync}
          className={`px-3 py-1 rounded text-xs transition-colors duration-200 ${
            isLipSyncEnabled 
              ? 'bg-green-600 hover:bg-green-700 text-white' 
              : 'bg-gray-600 hover:bg-gray-700 text-gray-300'
          }`}
        >
          {isLipSyncEnabled ? 'ON' : 'OFF'}
        </button>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleTestVoice}
          disabled={isPlaying}
          className="chat-button flex-1 text-xs py-2"
        >
          Test Voice
        </button>
        
        {isPlaying && (
          <button
            onClick={handleStopSpeaking}
            className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 text-xs"
          >
            Stop
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="space-y-3 pt-3 border-t border-white/10">
          {/* Voice Selection */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-2">Voice</label>
            <select
              value={ttsConfig.voice}
              onChange={(e) => setTtsConfig({ voice: e.target.value })}
              className="w-full p-2 bg-gray-700/50 border border-gray-600/50 rounded text-white text-xs"
            >
              {voices.map((voice) => (
                <option key={voice.name} value={voice.name}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
          </div>

          {/* Rate Control */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-2">
              Speed: {ttsConfig.rate.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={ttsConfig.rate}
              onChange={(e) => setTtsConfig({ rate: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>

          {/* Pitch Control */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-2">
              Pitch: {ttsConfig.pitch.toFixed(1)}
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={ttsConfig.pitch}
              onChange={(e) => setTtsConfig({ pitch: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>

          {/* Volume Control */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-2">
              Volume: {Math.round(ttsConfig.volume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={ttsConfig.volume}
              onChange={(e) => setTtsConfig({ volume: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}
