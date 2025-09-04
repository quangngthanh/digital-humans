import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { AiModule } from '../ai/ai.module';
import { TtsModule } from '../tts/tts.module';
import { LipsyncModule } from '../lipsync/lipsync.module';

@Module({
  imports: [AiModule, TtsModule, LipsyncModule],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
