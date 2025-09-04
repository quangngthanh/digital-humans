import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

import { AiService } from './ai.service';

@Module({
  providers: [
    AiService,
    {
      provide: 'GEMINI_CLIENT',
      useFactory: (configService: ConfigService) => {
        const apiKey = configService.get<string>('app.ai.geminiApiKey');
        if (!apiKey) {
          throw new Error('GEMINI_API_KEY is required');
        }
        return new GoogleGenerativeAI(apiKey);
      },
      inject: [ConfigService],
    },
  ],
  exports: [AiService],
})
export class AiModule {}
