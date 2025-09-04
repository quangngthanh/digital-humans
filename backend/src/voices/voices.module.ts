import { Module } from '@nestjs/common';
import { VoicesController } from './voices.controller';
import { VoicesService } from './voices.service';
import { TtsModule } from '../tts/tts.module';
import { LipsyncModule } from '../lipsync/lipsync.module';

@Module({
  imports: [TtsModule, LipsyncModule],
  controllers: [VoicesController],
  providers: [VoicesService],
})
export class VoicesModule {}
