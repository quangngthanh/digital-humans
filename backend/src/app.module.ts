import { Module, Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

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
        allowUnknown: false,
        abortEarly: true,
      },
    }),
    
    // Winston logging module
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.colorize(),
            winston.format.simple(),
          ),
        }),
      ],
    }),

    // Feature modules
    ChatModule,
    VoicesModule,
    AiModule,
    TtsModule,
    LipsyncModule,
  ],
  controllers: [HealthController],
  providers: [Logger],
})
export class AppModule {}
