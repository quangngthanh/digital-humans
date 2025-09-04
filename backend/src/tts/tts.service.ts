import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ElevenLabs } from '@elevenlabs/elevenlabs-js';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface TtsOptions {
  modelId?: string;
  stability?: number;
  similarityBoost?: number;
  style?: number;
  useSpeakerBoost?: boolean;
}

export interface VoiceInfo {
  voice_id: string;
  name: string;
  category: string;
  labels: Record<string, any>;
  preview_url?: string;
  available_for_tiers?: string[];
}

@Injectable()
export class TtsService {
  private readonly logger = new Logger(TtsService.name);

  constructor(
    @Inject('ELEVEN_LABS_CLIENT') private readonly elevenLabs: ElevenLabs,
    private readonly configService: ConfigService,
  ) {}

  async textToSpeech(
    text: string,
    fileName: string,
    voiceId?: string,
    options?: TtsOptions,
  ): Promise<string> {
    const finalVoiceId = voiceId || this.configService.get<string>('app.tts.defaultVoiceId');
    const audiosDir = this.configService.get<string>('app.paths.audiosDir');
    
    const finalOptions = {
      modelId: options?.modelId || this.configService.get<string>('app.tts.defaultModel'),
      stability: options?.stability ?? this.configService.get<number>('app.tts.stability'),
      similarityBoost: options?.similarityBoost ?? this.configService.get<number>('app.tts.similarityBoost'),
      style: options?.style ?? this.configService.get<number>('app.tts.style'),
      useSpeakerBoost: options?.useSpeakerBoost ?? this.configService.get<boolean>('app.tts.useSpeakerBoost'),
    };

    // Clean text for Vietnamese while preserving meaning
    const cleanText = this.cleanVietnameseText(text);
    
    this.logger.debug(`Generating TTS for text: "${cleanText.substring(0, 50)}..."`);
    this.logger.debug(`Voice ID: ${finalVoiceId}, Model: ${finalOptions.modelId}`);

    try {
      // Ensure audios directory exists
      await fs.mkdir(audiosDir, { recursive: true });
      
      const filePath = path.join(audiosDir, fileName);
      
      const response = await this.elevenLabs.textToSpeech.convert(finalVoiceId, {
        text: cleanText,
        model_id: finalOptions.modelId,
        voice_settings: {
          stability: finalOptions.stability,
          similarity_boost: finalOptions.similarityBoost,
          style: finalOptions.style,
          use_speaker_boost: finalOptions.useSpeakerBoost,
        },
      });

      // Save the audio file
      const audioBuffer = Buffer.from(await response.arrayBuffer());
      await fs.writeFile(filePath, audioBuffer);
      
      this.logger.debug(`Audio saved to: ${filePath}`);
      return filePath;

    } catch (error) {
      this.logger.error(`TTS generation failed: ${error.message}`, error.stack);
      
      // Try with English fallback if Vietnamese fails
      if (this.hasVietnameseChars(cleanText)) {
        this.logger.debug('Trying English fallback...');
        return this.textToSpeech(
          "Hello! I'm having trouble with Vietnamese text. Let me try again.",
          fileName,
          finalVoiceId,
          finalOptions,
        );
      }
      
      throw error;
    }
  }

  async getVoices(): Promise<VoiceInfo[]> {
    try {
      this.logger.debug('Fetching available voices from ElevenLabs');
      
      const response = await this.elevenLabs.voices.getAll();
      
      return response.voices.map(voice => ({
        voice_id: voice.voice_id,
        name: voice.name,
        category: voice.category,
        labels: voice.labels || {},
        preview_url: voice.preview_url,
        available_for_tiers: voice.available_for_tiers,
      }));
      
    } catch (error) {
      this.logger.error(`Failed to fetch voices: ${error.message}`, error.stack);
      throw error;
    }
  }

  async testVoice(
    voiceId: string,
    text: string,
    options?: TtsOptions,
  ): Promise<{ success: boolean; filePath?: string; error?: string }> {
    try {
      const timestamp = Date.now();
      const fileName = `test_${voiceId}_${timestamp}.mp3`;
      
      const filePath = await this.textToSpeech(text, fileName, voiceId, options);
      
      return {
        success: true,
        filePath,
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  private cleanVietnameseText(text: string): string {
    return text
      .replace(/[^\w\s\u00C0-\u1EF9.,!?;:()\-'"]/g, '') // Keep Vietnamese chars, punctuation, quotes, parentheses
      .replace(/\s+/g, ' ') // Normalize multiple spaces to single space
      .replace(/\s*([.,!?;:])\s*/g, '$1 ') // Fix spacing around punctuation
      .trim();
  }

  private hasVietnameseChars(text: string): boolean {
    const vietnameseRegex = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
    return vietnameseRegex.test(text);
  }
}
