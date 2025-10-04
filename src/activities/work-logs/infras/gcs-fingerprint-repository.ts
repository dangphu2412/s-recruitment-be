import { FileMetadata, Storage } from '@google-cloud/storage';
import { ConfigService } from '@nestjs/config';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import {
  FingerPrintLogViewDTO,
  FingerPrintUserViewDTO,
  FingerPrintUserViewItemDTO,
} from '../domain/view/finger-print-view.dto';
import { FingerPrintLogsRepository } from '../application/interfaces/finger-print-logs.repository';
import { WorkLogExtractor } from './work-log-extractor';

type ExternalFingerPrintLogDTO = {
  userSn: number;
  deviceUserId: string;
  recordTime: string;
};

@Injectable()
export class GCSFingerPrintRepository
  implements OnModuleInit, FingerPrintLogsRepository
{
  private readonly logger = new Logger(GCSFingerPrintRepository.name);
  private readonly storage: Storage;
  private readonly serviceAccountFilePath = join(
    process.cwd(),
    'service_account.json',
  );
  private readonly logsFilePath = join(process.cwd(), 'logs.json');
  private readonly logsFileMetaPath = join(process.cwd(), 'logs.meta.json');

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

  async findLogsOfSixMonth(): Promise<FingerPrintLogViewDTO[]> {
    const fullLogs = await this.findFullLogs();

    return WorkLogExtractor.extractLogsFromLastHalfYear(fullLogs);
  }

  private async findFullLogs() {
    const bucket = this.storage.bucket('sgroup-bucket');
    const file = bucket.file('attendances.json');

    const [metadata] = await file.getMetadata();
    const lastCachedMetadata = await this.getLastCachedMetadata();

    if (lastCachedMetadata.updated !== metadata.updated) {
      this.logger.log('Cache outdated, syncing from GCS');

      const newFile = (await file.download())[0];
      this.logger.log('Writing to cache');

      /**
       * TODO: Lock file on concurrent write
       */
      await Promise.all([
        writeFile(this.logsFilePath, newFile),
        writeFile(this.logsFileMetaPath, JSON.stringify(metadata), 'utf-8'),
      ]);

      return JSON.parse(
        newFile.toString('utf-8'),
      ) as ExternalFingerPrintLogDTO[];
    }

    this.logger.log('Utilize cached logs');

    return JSON.parse(
      await readFile(this.logsFilePath, 'utf-8'),
    ) as ExternalFingerPrintLogDTO[];
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

  async findUsers(): Promise<FingerPrintUserViewItemDTO[]> {
    const bucket = this.storage.bucket('sgroup-bucket');
    const file = bucket.file('users.json');

    const data = JSON.parse(
      (await file.download())[0].toString('utf-8'),
    ) as FingerPrintUserViewDTO;

    const items = data.data;

    if (items[0].userId === undefined || items[0].name === undefined) {
      throw new InternalServerErrorException(
        'Invalid user schema from fingerprint system.',
      );
    }

    return items;
  }
}
