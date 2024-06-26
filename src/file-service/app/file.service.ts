import { Injectable, Logger } from '@nestjs/common';
import { CreateFileCommand, FileUploadResponse } from '../domain/dto/file.dto';
import { FileService } from '../domain/services/file.service';
import { EnvironmentKeyFactory } from '../../system/services';
import { writeFile } from 'node:fs/promises';

@Injectable()
export class FileServiceImpl implements FileService {
  private readonly uploadDir: string;

  constructor(environmentKeyFactory: EnvironmentKeyFactory) {
    this.uploadDir = environmentKeyFactory.getUploadDir();
  }

  private generateFullPath(path: string): string {
    return `${this.uploadDir}/${path}`;
  }

  private generatePublicPath(originalName: string): string {
    const date = new Date();

    return `${date.getFullYear()}-${date.getMonth()}-${originalName}`;
  }

  async upload(fileCommand: CreateFileCommand): Promise<FileUploadResponse> {
    const path = this.generatePublicPath(fileCommand.originalname);
    const fullPath = this.generateFullPath(path);

    Logger.log(`Uploading file to ${fullPath}`, FileServiceImpl.name);

    await writeFile(fullPath, fileCommand.buffer);

    return {
      path,
    };
  }
}
