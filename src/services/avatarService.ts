import { Avatar } from '../types';
import { DEFAULT_AVATARS } from '../utils/constants';

class AvatarService {
  private cache = new Map<string, string>();

  async getDefaultAvatars(): Promise<Avatar[]> {
    return DEFAULT_AVATARS;
  }

  async loadAvatar(avatarId: string): Promise<string> {
    // Check cache first
    if (this.cache.has(avatarId)) {
      return this.cache.get(avatarId)!;
    }

    const avatarUrl = `https://models.readyplayer.me/${avatarId}.glb`;
    
    try {
      // Test if avatar URL is accessible
      const response = await fetch(avatarUrl, { method: 'HEAD' });
      
      if (!response.ok) {
        throw new Error(`Avatar not found: ${response.status}`);
      }

      // Cache the URL
      this.cache.set(avatarId, avatarUrl);
      return avatarUrl;
    } catch (error) {
      console.error('Failed to load avatar:', error);
      throw new Error('Avatar could not be loaded');
    }
  }

  isValidAvatarId(id: string): boolean {
    // Ready Player Me avatar IDs are typically 24-character hex strings
    return /^[a-f0-9]{24}$/i.test(id);
  }

  getAvatarThumbnail(avatarId: string): string {
    return `https://models.readyplayer.me/${avatarId}.png`;
  }

  clearCache() {
    this.cache.clear();
  }
}

export const avatarService = new AvatarService();
