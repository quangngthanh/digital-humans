import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import configuration from './config/configuration';
import { validationSchema } from './config/validation';
import { ChatModule } from './chat/chat.module';
import { VoicesModule } from './voices/voices.module';
import { AiModule } from './ai/ai.module';
import { TtsModule } from './tts/tts.module';
import { LipsyncModule } from './lipsync/lipsync.module';
import { HealthController } from './common/controllers/health.controller';

@Module({
  imports: [
    // Configuration module with validation
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
    }),

    // Feature modules
    ChatModule,
    VoicesModule,
    AiModule,
    TtsModule,
    LipsyncModule,
  ],
  controllers: [
    HealthController,
  ],
})
export class AppModule {}
