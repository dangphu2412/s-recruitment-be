import { Injectable } from '@nestjs/common';
import { CreateFileCommand, FileUploadResponse } from '../domain/dto/file.dto';
import { FileService } from '../domain/services/file.service';
import { EnvironmentKeyFactory } from '../../system/services';
import { writeFile, readFile } from 'node:fs/promises';

@Injectable()
export class FileServiceImpl implements FileService {
  private readonly uploadDir: string;

  constructor(environmentKeyFactory: EnvironmentKeyFactory) {
    this.uploadDir = environmentKeyFactory.getUploadDir();
  }

  private getFullPath(path: string): string {
    return `${this.uploadDir}/${path}`;
  }

  private generatePath(originalName: string): string {
    const date = new Date();

    return `${date.getFullYear()}-${date.getMonth()}-${originalName}`;
  }

  async upload(fileCommand: CreateFileCommand): Promise<FileUploadResponse> {
    const path = this.generatePath(fileCommand.originalname);

    await writeFile(this.getFullPath(path), fileCommand.buffer);

    return {
      path,
    };
  }

  getFile(path: string): Promise<Buffer> {
    return readFile(this.getFullPath(path));
  }
}
