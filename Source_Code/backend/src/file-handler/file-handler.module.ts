import { Module } from '@nestjs/common';
import { FileHandlerService } from './file-handler.service';
import { FileHandlerController } from './file-handler.controller';
import { BinHandlerService } from './bin-handler.service';
import { VoiceHandlerService } from './voice-handler.service';

@Module({
  controllers: [FileHandlerController],
  providers: [FileHandlerService, BinHandlerService, VoiceHandlerService],
})
export class FileHandlerModule {}
