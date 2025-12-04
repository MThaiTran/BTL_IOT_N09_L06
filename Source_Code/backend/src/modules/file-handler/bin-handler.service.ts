import { Injectable } from '@nestjs/common';
import { CreateFileHandlerDto } from './dto/create-file-handler.dto';
import { UpdateFileHandlerDto } from './dto/update-file-handler.dto';

@Injectable()
export class BinHandlerService {
  handleBinFile(file: Express.Multer.File, deviceId?: number) {
    return 'Handling bin file logic';
  }
}
