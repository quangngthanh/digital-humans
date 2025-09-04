import { Module } from '@nestjs/common';
import { LipsyncService } from './lipsync.service';

@Module({
  providers: [LipsyncService],
  exports: [LipsyncService],
})
export class LipsyncModule {}
