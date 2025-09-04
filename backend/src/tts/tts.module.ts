import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

import { TtsService } from './tts.service';

@Module({
  providers: [
    TtsService,
    {
      provide: 'ELEVEN_LABS_CLIENT',
      useFactory: (configService: ConfigService) => {
        const apiKey = configService.get<string>('app.tts.elevenLabsApiKey');
        if (!apiKey) {
          throw new Error('ELEVEN_LABS_API_KEY is required');
        }
        return new ElevenLabsClient({ apiKey });
      },
      inject: [ConfigService],
    },
  ],
  exports: [TtsService],
})
export class TtsModule {}
