import { FileMetadata, Storage } from '@google-cloud/storage';
import { ConfigService } from '@nestjs/config';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class LogFileService implements OnModuleInit {
  private readonly logger = new Logger(LogFileService.name);
  private storage: Storage;
  private serviceAccountFilePath = join(process.cwd(), 'service_account.json');
  private logsFilePath = join(process.cwd(), 'logs.json');
  private logsFileMetaPath = join(process.cwd(), 'logs.meta.json');

  constructor(private readonly configService: ConfigService) {
    this.storage = new Storage({
      projectId: this.configService.getOrThrow('GCP_PROJECT_ID'),
      keyFilename: this.serviceAccountFilePath,
    });
  }

  async onModuleInit() {
    await writeFile(
      this.serviceAccountFilePath,
      this.configService.getOrThrow<string>('GCP_SERVICE_ACCOUNT'),
    );
  }

  /**
   * TODO: Lock file writing while concurrent occur
   */
  async getLogs(): Promise<Buffer> {
    const bucket = this.storage.bucket('sgroup-bucket');
    const file = bucket.file('attendances.json');

    const [metadata] = await file.getMetadata();
    const lastCachedMetadata = await this.getLastCachedMetadata();

    if (lastCachedMetadata.updated !== metadata.updated) {
      this.logger.log('Cache outdated, syncing from GCS');

      const newFile = (await file.download())[0];
      this.logger.log('Writing to cache');

      await writeFile(this.logsFilePath, newFile);
      await writeFile(this.logsFileMetaPath, JSON.stringify(metadata), 'utf-8');
      return newFile;
    }

    this.logger.log('Utilize cached logs');

    return readFile(this.logsFilePath);
  }

  private async getLastCachedMetadata(): Promise<FileMetadata> {
    try {
      return JSON.parse(
        await readFile(this.logsFileMetaPath, 'utf-8'),
      ) as FileMetadata;
    } catch {
      return {
        updated: '',
      };
    }
  }

  async getUsers(): Promise<Buffer> {
    const bucket = this.storage.bucket('sgroup-bucket');
    const file = bucket.file('users.json');

    return (await file.download())[0];
  }
}
