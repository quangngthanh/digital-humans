import { Injectable, Logger } from '@nestjs/common';
import { TtsService, VoiceInfo } from '../tts/tts.service';
import { LipsyncService } from '../lipsync/lipsync.service';

@Injectable()
export class VoicesService {
  private readonly logger = new Logger(VoicesService.name);

  constructor(
    private readonly ttsService: TtsService,
    private readonly lipsyncService: LipsyncService,
  ) {}

  async getAllVoices(): Promise<{ success: boolean; total: number; voices: VoiceInfo[] }> {
    try {
      this.logger.debug('Fetching all available voices');
      
      const voices = await this.ttsService.getVoices();
      
      return {
        success: true,
        total: voices.length,
        voices,
      };
      
    } catch (error) {
      this.logger.error(`Failed to fetch voices: ${error.message}`, error.stack);
      throw error;
    }
  }

  async testVoice(
    voiceId: string,
    text: string,
    model?: string,
  ): Promise<{
    success: boolean;
    message?: string;
    voiceId: string;
    model: string;
    text: string;
    audio?: string;
    error?: string;
  }> {
    try {
      this.logger.debug(`Testing voice ${voiceId} with text: "${text.substring(0, 50)}..."`);
      
      const testOptions = {
        modelId: model || 'eleven_flash_v2_5',
        stability: 0.5,
        similarityBoost: 0.8,
        style: 0.2,
        useSpeakerBoost: true,
      };

      const result = await this.ttsService.testVoice(voiceId, text, testOptions);

      if (result.success && result.filePath) {
        const audioBase64 = await this.lipsyncService.audioFileToBase64(result.filePath);
        
        return {
          success: true,
          message: `Audio generated successfully with ${testOptions.modelId}`,
          voiceId,
          model: testOptions.modelId,
          text,
          audio: audioBase64,
        };
      } else {
        return {
          success: false,
          error: result.error || 'Unknown error occurred',
          voiceId,
          model: testOptions.modelId,
          text,
        };
      }
      
    } catch (error) {
      this.logger.error(`Voice test failed: ${error.message}`, error.stack);
      
      return {
        success: false,
        error: error.message,
        voiceId,
        model: model || 'eleven_flash_v2_5',
        text,
      };
    }
  }

  getRecommendedVoices(): string[] {
    // These are voices that work well with Vietnamese and multilingual content
    return [
      'RmcV9cAq1TByxNSgbii7', // Default voice
      '21m00Tcm4TlvDq8ikWAM', // Rachel
      'AZnzlk1XvdvUeBnXmlld', // Domi
      'EXAVITQu4vr4xnSDxMaL', // Bella
      'MF3mGyEYCl7XYWbV9V6O', // Elli
      'TxGEqnHWrfWFTfGW9XjX', // Josh
      'VR6AewLTigWG4xSOukaG', // Arnold
      'pNInz6obpgDQGcFmaJgB', // Adam
    ];
  }
}
