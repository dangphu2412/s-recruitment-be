import { Test, TestingModule } from '@nestjs/testing';
import { utils, write } from 'xlsx';
import { ActivityLogServiceImpl } from '../../../src/activities/work-logs/application/activity-log.service';
import { ActivityLogRepository } from '../../../src/activities/work-logs/infras/activity-log.repository';
import { ActivityRepository } from '../../../src/activities/managements/activity.repository';
import { ActivityMatcher } from '../../../src/activities/work-logs/application/work-status-evaluator.service';
import { LogFileService } from '../../../src/activities/work-logs/infras/log-file.service';
import { OffsetPaginationResponse } from '../../../src/system/pagination';
import { ActivityLog } from '../../../src/system/database/entities/activity-log.entity';
import { ReportLogAggregate } from '../../../src/activities/shared/aggregates/report-log.aggregate';

jest.mock('../../../src/activities/work-logs/application/work-log-extractor');
jest.mock('xlsx', () => ({
  utils: {
    json_to_sheet: jest.fn(),
    book_new: jest.fn(),
    book_append_sheet: jest.fn(),
  },
  write: jest.fn(),
}));

describe('ActivityLogService', () => {
  let service: ActivityLogServiceImpl;
  let activityLogRepository: jest.Mocked<ActivityLogRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivityLogServiceImpl,
        {
          provide: ActivityLogRepository,
          useValue: {
            findLogs: jest.fn(),
            updateLogs: jest.fn(),
            findLateReportLogs: jest.fn(),
          },
        },
        {
          provide: ActivityRepository,
          useValue: {
            findActivitiesByDeviceUserIds: jest.fn(),
          },
        },
        {
          provide: ActivityMatcher,
          useValue: {
            match: jest.fn(),
          },
        },
        {
          provide: LogFileService,
          useValue: {
            getLogs: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(ActivityLogServiceImpl);
    activityLogRepository = module.get(
      ActivityLogRepository,
    ) as jest.Mocked<ActivityLogRepository>;
  });

  describe('findLogs', () => {
    it('should return paginated logs', async () => {
      // Arrange
      const request = { page: 1, limit: 10 } as any;
      const items = [{ fromTime: 'name' }] as ActivityLog[];
      const totalRecords = 1;
      jest
        .spyOn(activityLogRepository, 'findLogs')
        .mockResolvedValue([items, totalRecords]);

      // Act
      const result = await service.findLogs(request);

      // Assert
      expect(activityLogRepository.findLogs).toHaveBeenCalledWith(request);
      expect(result).toBeInstanceOf(OffsetPaginationResponse);
      expect(result.items).toEqual(items);
    });
  });

  describe('downloadReportFile', () => {
    it('should create an Excel report buffer', async () => {
      // Arrange
      const logs: ReportLogAggregate[] = [
        { id: '1', email: 'a@test.com', fullName: 'User A', lateCount: 2 },
        { id: '2', email: 'b@test.com', fullName: 'User B', lateCount: 1 },
      ];
      jest
        .spyOn(activityLogRepository, 'findLateReportLogs')
        .mockResolvedValue(logs);
      (utils.json_to_sheet as jest.Mock).mockReturnValue('sheet');
      (utils.book_new as jest.Mock).mockReturnValue('workbook');
      const appendSpy = jest.spyOn(utils, 'book_append_sheet');
      (write as jest.Mock).mockReturnValue(Buffer.from('excel-data'));

      // Act
      const result = await service.downloadLateReportFile();

      // Assert
      expect(activityLogRepository.findLateReportLogs).toHaveBeenCalled();
      expect(utils.json_to_sheet).toHaveBeenCalledWith([
        { email: 'a@test.com', fullName: 'User A', lateCount: 2 },
        { email: 'b@test.com', fullName: 'User B', lateCount: 1 },
      ]);
      expect(utils.book_new).toHaveBeenCalled();
      expect(appendSpy).toHaveBeenCalledWith('workbook', 'sheet', 'Reports');
      expect(write).toHaveBeenCalledWith('workbook', {
        type: 'buffer',
        bookType: 'xlsx',
      });
      expect(result).toBeInstanceOf(Buffer);
    });
  });
});
