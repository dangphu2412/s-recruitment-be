import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { InternalServerErrorException } from '@nestjs/common';
import { readFile, writeFile } from 'fs/promises';
import { Bucket, File, Storage } from '@google-cloud/storage';
import { GCSFingerPrintRepository } from '../../../src/activities/work-logs/infras/gcs-fingerprint-repository';
import { WorkLogExtractor } from '../../../src/activities/work-logs/infras/work-log-extractor';

jest.mock('fs/promises', () => ({
  readFile: jest.fn(),
  writeFile: jest.fn(),
}));

jest.mock('@google-cloud/storage', () => {
  const Storage = jest.fn();
  return { Storage };
});

jest.mock(
  '../../../src/activities/work-logs/infras/work-log-extractor',
  () => ({
    WorkLogExtractor: {
      extractLogsFromLastHalfYear: jest.fn(),
    },
  }),
);

describe('GCSFingerPrintRepository', () => {
  let repo: GCSFingerPrintRepository;
  let configServiceMock: { getOrThrow: jest.Mock };
  let mockStorage: jest.Mocked<Storage>;
  let mockBucket: jest.Mocked<Bucket>;
  let mockFile: jest.Mocked<File>;

  beforeEach(async () => {
    jest.clearAllMocks();

    mockFile = {
      getMetadata: jest.fn(),
      download: jest.fn(),
      // unused File methods need to exist for typing but can be no-op
      save: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
      createReadStream: jest.fn(),
      createWriteStream: jest.fn(),
      copy: jest.fn(),
      move: jest.fn(),
      getSignedUrl: jest.fn(),
      setMetadata: jest.fn(),
      makePublic: jest.fn(),
      makePrivate: jest.fn(),
      isPublic: jest.fn(),
      acl: {} as any,
      name: 'mock-file',
      bucket: {} as any,
      id: 'mock-id',
      metadata: {},
      storage: {} as any,
    } as unknown as jest.Mocked<File>;

    mockBucket = {
      file: jest.fn().mockReturnValue(mockFile),
      name: 'mock-bucket',
      storage: {} as any,
      create: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
      get: jest.fn(),
      getFiles: jest.fn(),
      upload: jest.fn(),
      acl: {} as any,
      iam: {} as any,
    } as unknown as jest.Mocked<Bucket>;

    mockStorage = {
      bucket: jest.fn().mockReturnValue(mockBucket),
      getBuckets: jest.fn(),
      createBucket: jest.fn(),
    } as unknown as jest.Mocked<Storage>;

    (Storage as unknown as jest.Mock).mockImplementation(() => mockStorage);

    configServiceMock = {
      getOrThrow: jest.fn((key: string) => {
        if (key === 'GCP_PROJECT_ID') return 'fake-project';
        if (key === 'GCP_SERVICE_ACCOUNT') return 'fake-service-account-json';
        throw new Error('unknown-key');
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GCSFingerPrintRepository,
        { provide: ConfigService, useValue: configServiceMock },
      ],
    }).compile();

    repo = module.get(GCSFingerPrintRepository);
  });

  it('should call ConfigService.getOrThrow for constructor', () => {
    expect(configServiceMock.getOrThrow).toHaveBeenCalledWith('GCP_PROJECT_ID');
  });

  it('onModuleInit writes service account file', async () => {
    await repo.onModuleInit();
    expect(writeFile).toHaveBeenCalledWith(
      expect.stringContaining('service_account.json'),
      'fake-service-account-json',
    );
  });

  it('findUsers returns parsed users when schema valid', async () => {
    (mockFile.download as jest.Mock).mockResolvedValue([
      Buffer.from(JSON.stringify({ data: [{ userId: 1, name: 'Alice' }] })),
    ]);

    const result = await repo.findUsers();

    expect(mockStorage.bucket).toHaveBeenCalledWith('sgroup-bucket');
    expect(mockBucket.file).toHaveBeenCalledWith('users.json');
    expect(result).toEqual([{ userId: 1, name: 'Alice' }]);
  });

  it('findUsers throws when user schema invalid', async () => {
    (mockFile.download as jest.Mock).mockResolvedValue([
      Buffer.from(JSON.stringify({ data: [{}] })),
    ]);

    await expect(repo.findUsers()).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );
  });

  it('findFullLogs syncs from GCS when metadata outdated and caches new file', async () => {
    (mockFile.getMetadata as jest.Mock).mockResolvedValue([
      { updated: '2025-10-01T00:00:00Z' },
    ]);
    (mockFile.download as jest.Mock).mockResolvedValue([
      Buffer.from(JSON.stringify([{ userSn: 10 }])),
    ]);
    (readFile as jest.Mock).mockRejectedValueOnce(new Error('no meta'));

    const result = await (repo as any).findFullLogs();

    expect(mockBucket.file).toHaveBeenCalledWith('attendances.json');
    expect(mockFile.getMetadata).toHaveBeenCalled();
    expect(writeFile).toHaveBeenCalledTimes(2);
    const writtenLogsBuffer = (writeFile as jest.Mock).mock.calls[0][1];
    expect(JSON.parse(writtenLogsBuffer.toString('utf-8'))).toEqual([
      { userSn: 10 },
    ]);
    expect(result).toEqual([{ userSn: 10 }]);
  });

  it('findFullLogs uses cache when metadata unchanged', async () => {
    (mockFile.getMetadata as jest.Mock).mockResolvedValue([
      { updated: 'same-ts' },
    ]);
    (readFile as jest.Mock)
      .mockResolvedValueOnce(JSON.stringify({ updated: 'same-ts' }))
      .mockResolvedValueOnce(JSON.stringify([{ userSn: 99 }]));

    const result = await (repo as any).findFullLogs();

    expect(mockBucket.file).toHaveBeenCalledWith('attendances.json');
    expect(result).toEqual([{ userSn: 99 }]);
    expect(writeFile).not.toHaveBeenCalled();
  });

  it('findLogsOfSixMonth delegates to WorkLogExtractor', async () => {
    (repo as any).findFullLogs = jest.fn().mockResolvedValue([{ userSn: 5 }]);
    (WorkLogExtractor.extractLogsFromLastHalfYear as jest.Mock).mockReturnValue(
      ['processed'],
    );

    const result = await repo.findLogsOfSixMonth();

    expect((repo as any).findFullLogs).toHaveBeenCalled();
    expect(WorkLogExtractor.extractLogsFromLastHalfYear).toHaveBeenCalledWith([
      { userSn: 5 },
    ]);
    expect(result).toEqual(['processed']);
  });
});
