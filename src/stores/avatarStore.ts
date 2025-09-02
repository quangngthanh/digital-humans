import { create } from 'zustand';
import type { Avatar, TTSConfig, AudioData } from '../types';
import { DEFAULT_TTS_CONFIG } from '../utils/constants';

interface AvatarStore {
  currentAvatar: Avatar | null;
  isLoading: boolean;
  isPlaying: boolean;
  ttsConfig: TTSConfig;
  audioData: AudioData | null;
  
  // Actions
  setCurrentAvatar: (avatar: Avatar | null) => void;
  setLoading: (loading: boolean) => void;
  setPlaying: (playing: boolean) => void;
  setTtsConfig: (config: Partial<TTSConfig>) => void;
  setAudioData: (data: AudioData | null) => void;
}

export const useAvatarStore = create<AvatarStore>((set) => ({
  currentAvatar: null,
  isLoading: false,
  isPlaying: false,
  ttsConfig: DEFAULT_TTS_CONFIG,
  audioData: null,

  setCurrentAvatar: (avatar: Avatar | null) => 
    set({ currentAvatar: avatar }),

  setLoading: (loading: boolean) => 
    set({ isLoading: loading }),

  setPlaying: (playing: boolean) => 
    set({ isPlaying: playing }),

  setTtsConfig: (config: Partial<TTSConfig>) =>
    set((state) => ({
      ttsConfig: { ...state.ttsConfig, ...config }
    })),

  setAudioData: (data: AudioData | null) =>
    set({ audioData: data })
}));
