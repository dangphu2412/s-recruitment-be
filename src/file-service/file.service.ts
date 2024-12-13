import { Injectable, Logger } from '@nestjs/common';
import { CreateFileDTO, CreatedFileDTO } from './domain/core/dto/file.dto';
import { FileService } from './domain/core/file.service';
import { EnvironmentKeyFactory } from '../system/services';
import { writeFile } from 'node:fs/promises';
import { createReadStream, ReadStream } from 'node:fs';

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

  async upload(fileCommand: CreateFileDTO): Promise<CreatedFileDTO> {
    const path = this.generatePublicPath(fileCommand.originalname);
    const fullPath = this.generateFullPath(path);

    Logger.log(`Uploading file to ${fullPath}`, FileServiceImpl.name);

    await writeFile(fullPath, fileCommand.buffer);

    return {
      path,
    };
  }

  findByPath(filePath: string): ReadStream {
    const fullPath = this.generateFullPath(filePath);

    return createReadStream(fullPath);
  }
}
