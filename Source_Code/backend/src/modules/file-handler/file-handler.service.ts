import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateFileHandlerDto } from './dto/create-file-handler.dto';
import { UpdateFileHandlerDto } from './dto/update-file-handler.dto';
import { VoiceHandlerService } from './voice-handler.service';
import { BinHandlerService } from './bin-handler.service';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FileHandlerService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads');

  constructor(
    private readonly voiceHandlerService: VoiceHandlerService,
    private readonly binHandlerService: BinHandlerService,
  ) {
    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  handleFile(
    file: Express.Multer.File,
    fileType: 'audio' | 'bin' | 'other',
    version: number,
    deviceId?: number,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Save file to disk
    const savedFile = this.saveFile(file, fileType, version, deviceId);

    if (fileType === 'audio') {
      return {
        ...savedFile,
        message: this.voiceHandlerService.handleVoiceFile(file),
      };
    } else if (fileType === 'bin') {
      return {
        ...savedFile,
        message: this.binHandlerService.handleBinFile(file, deviceId),
      };
    } else {
      return { ...savedFile, message: 'File stored successfully' };
    }
  }

  private saveFile(
    file: Express.Multer.File,
    fileType: 'audio' | 'bin' | 'other',
    version: number,
    deviceId?: number,
  ) {
    const fileExt = path.extname(file.originalname);
    const fileName = `${version}_${fileType || 'general'}_${uuidv4()}${fileExt}`;
    const fileSubDir = path.join(this.uploadDir, fileType);

    // Create type-specific subdirectory if not exists
    if (!fs.existsSync(fileSubDir)) {
      fs.mkdirSync(fileSubDir, { recursive: true });
    }

    const filePath = path.join(fileSubDir, fileName);
    fs.writeFileSync(filePath, file.buffer);

    return {
      id: uuidv4(),
      fileName,
      originalName: file.originalname,
      fileType,
      fileSize: file.size,
      mimeType: file.mimetype,
      uploadedAt: new Date().toISOString(),
      deviceId: deviceId || null,
      downloadUrl: `/file-handler/download/${fileType}/${fileName}`,
    };
  }

  getFile(fileType: string, fileName: string) {
    const filePath = path.join(this.uploadDir, fileType, fileName);

    // Security: prevent directory traversal
    const realPath = path.resolve(filePath);
    const realUploadDir = path.resolve(this.uploadDir);
    if (!realPath.startsWith(realUploadDir)) {
      throw new BadRequestException('Invalid file path');
    }

    if (!fs.existsSync(filePath)) {
      throw new BadRequestException('File not found');
    }

    return filePath;
  }

  listFiles(fileType?: string) {
    const searchDir = fileType
      ? path.join(this.uploadDir, fileType)
      : this.uploadDir;

    if (!fs.existsSync(searchDir)) {
      return [];
    }

    const files: any[] = [];
    const dirs = fs.readdirSync(searchDir);

    dirs.forEach((dir) => {
      const dirPath = path.join(searchDir, dir);
      const stat = fs.statSync(dirPath);

      if (stat.isDirectory()) {
        const dirFiles = fs.readdirSync(dirPath);
        dirFiles.forEach((file) => {
          const filePath = path.join(dirPath, file);
          const fileStat = fs.statSync(filePath);
          files.push({
            fileName: file,
            fileType: dir,
            fileSize: fileStat.size,
            version: file.split('_')[0],
            uploadedAt: fileStat.mtime.toISOString(),
            downloadUrl: `/file-handler/download/${dir}/${file}`,
          });
        });
      }
    });

    return files;
  }
}
