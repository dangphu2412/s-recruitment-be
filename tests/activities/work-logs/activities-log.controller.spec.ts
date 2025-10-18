import { Test, TestingModule } from '@nestjs/testing';
import { StreamableFile } from '@nestjs/common';
import { ActivitiesLogController } from '../../../src/activities/work-logs/presentation/activities-log.controller';
import { FindLogsRequest } from '../../../src/activities/work-logs/presentation/dtos/find-logs.request';
import { OffsetPaginationResponse } from '../../../src/system/pagination';
import { ActivityLog } from '../../../src/system/database/entities/activity-log.entity';
import { ActivityLogService } from '../../../src/activities/work-logs/application/interfaces/activity-log.service';

describe('ActivitiesLogController', () => {
  let controller: ActivitiesLogController;
  let service: ActivityLogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActivitiesLogController],
      providers: [
        {
          provide: ActivityLogService,
          useValue: {
            findLogs: jest.fn(),
            runUserLogComplianceCheck: jest.fn(),
            downloadLateReportFile: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ActivitiesLogController>(ActivitiesLogController);
    service = module.get<ActivityLogService>(ActivityLogService);
  });

  describe('findLogs', () => {
    it('should call service.findLogs with request and return result', async () => {
      // Arrange
      const request: FindLogsRequest = {
        userId: '123',
        page: 1,
        limit: 10,
      } as unknown as FindLogsRequest;
      const expectedLogs = {
        items: [{ fromTime: 'log1' }],
        metadata: {
          totalPages: 1,
          totalRecords: 100,
          page: 1,
          size: 10,
        },
      } as OffsetPaginationResponse<ActivityLog>;
      jest.spyOn(service, 'findLogs').mockResolvedValue(expectedLogs);

      // Act
      const result = await controller.findLogs(request);

      // Assert
      expect(service.findLogs).toHaveBeenCalledWith(request);
      expect(result).toEqual(expectedLogs);
    });
  });

  describe('uploadActivityLogs', () => {
    it('should call service.uploadActivityLogs and return result', async () => {
      // Arrange
      jest
        .spyOn(service, 'runUserLogComplianceCheck')
        .mockResolvedValue(undefined);

      // Act
      const result = await controller.runUserLogComplianceCheck();

      // Assert
      expect(service.runUserLogComplianceCheck).toHaveBeenCalled();
      expect(result).toEqual(undefined);
    });
  });

  describe('downloadReportFile', () => {
    it('should return a StreamableFile with correct headers', async () => {
      // Arrange
      const fakeStream = Buffer.from('fake-report');
      jest
        .spyOn(service, 'downloadLateReportFile')
        .mockResolvedValue(fakeStream);

      // Act
      const result = await controller.downloadReportFile();

      // Assert
      expect(service.downloadLateReportFile).toHaveBeenCalled();
      expect(result).toBeInstanceOf(StreamableFile);

      // Check headers
      const headers = (result as any).options;
      expect(headers.type).toBe(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      expect(headers.disposition).toBe('attachment; filename=report.xlsx');
    });
  });
});
