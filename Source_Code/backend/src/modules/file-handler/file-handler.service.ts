import { Injectable } from '@nestjs/common';
import { CreateFileHandlerDto } from './dto/create-file-handler.dto';
import { UpdateFileHandlerDto } from './dto/update-file-handler.dto';
import { VoiceHandlerService } from './voice-handler.service';
import { BinHandlerService } from './bin-handler.service';

@Injectable()
export class FileHandlerService {
  constructor(
    private readonly voiceHandlerService: VoiceHandlerService,
    private readonly binHandlerService: BinHandlerService,
  ) {}
  handleFile(
    file: Express.Multer.File,
    fileType: 'audio' | 'bin' | 'other',
    deviceId?: number,
  ) {
    if (fileType === 'audio') {
      return this.voiceHandlerService.handleVoiceFile(file);
    } else if (fileType === 'bin') {
      return this.binHandlerService.handleBinFile(file, deviceId);
    } else {
      // Xử lý các loại file khác
      return 'Handling other file types logic';
    }
  }
}
