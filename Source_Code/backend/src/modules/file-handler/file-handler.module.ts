import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { FileHandlerService } from './file-handler.service';
import { FileHandlerController } from './file-handler.controller';
import { BinHandlerService } from './bin-handler.service';
import { VoiceHandlerService } from './voice-handler.service';
import * as path from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: path.join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
      exclude: ['/file-handler(.*)'],
    }),
  ],
  controllers: [FileHandlerController],
  providers: [FileHandlerService, BinHandlerService, VoiceHandlerService],
})
export class FileHandlerModule {}
