import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Res,
  Query,
} from '@nestjs/common';
import { FileHandlerService } from './file-handler.service';
import { CreateFileHandlerDto } from './dto/create-file-handler.dto';
import { UpdateFileHandlerDto } from './dto/update-file-handler.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import * as fs from 'fs';

@Controller('file-handler')
export class FileHandlerController {
  constructor(private readonly fileHandlerService: FileHandlerService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('fileType') fileType: 'audio' | 'bin' | 'other',
    @Body('version') version: number,
    @Body('deviceId') deviceId?: number,
  ) {
    console.log('Uploading file:', file?.originalname);
    console.log('File type:', fileType);
    console.log('Device ID:', deviceId);
    return this.fileHandlerService.handleFile(
      file,
      fileType,
      version,
      deviceId,
    );
  }

  @Get('download/:fileType/:fileName')
  downloadFile(
    @Param('fileType') fileType: string,
    @Param('fileName') fileName: string,
    @Res() res: Response,
  ) {
    const filePath = this.fileHandlerService.getFile(fileType, fileName);
    const fileStream = fs.createReadStream(filePath);

    // Set proper headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'application/octet-stream');

    fileStream.pipe(res);
    fileStream.on('error', (err) => {
      res.status(500).send('Error downloading file');
    });
  }

  @Get('file-info/:fileType/:fileName')
  getFileInfo(
    @Param('fileType') fileType: string,
    @Param('fileName') fileName: string,
  ) {
    return this.fileHandlerService.getFile(fileType, fileName);
  }

  @Get('list')
  listFiles(@Query('fileType') fileType?: string) {
    return this.fileHandlerService.listFiles(fileType);
  }
}
