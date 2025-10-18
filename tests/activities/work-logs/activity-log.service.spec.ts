import { Test, TestingModule } from '@nestjs/testing';
import { utils, write } from 'xlsx';
import { ActivityLogServiceImpl } from '../../../src/activities/work-logs/application/activity-log.service';
import { ActivityLogRepository } from '../../../src/activities/work-logs/infras/activity-log.repository';
import { ActivityRepository } from '../../../src/activities/managements/activity.repository';
import {
  ActivityMatcher,
  WorkTimeUtils,
} from '../../../src/activities/work-logs/application/work-status-evaluator.service';
import { OffsetPaginationResponse } from '../../../src/system/pagination';
import {
  ActivityLog,
  LogWorkStatus,
} from '../../../src/system/database/entities/activity-log.entity';
import { LateReportViewDTO } from '../../../src/activities/work-logs/domain/view/late-report-view.dto';
import { FingerPrintLogsRepository } from '../../../src/activities/work-logs/application/interfaces/finger-print-logs.repository';

jest.mock('../../../src/activities/work-logs/infras/work-log-extractor');
jest.mock('xlsx', () => ({
  utils: {
    json_to_sheet: jest.fn(),
    book_new: jest.fn(),
    book_append_sheet: jest.fn(),
  },
  write: jest.fn(),
}));
jest.mock(
  '../../../src/activities/work-logs/application/work-status-evaluator.service',
);

describe('ActivityLogService', () => {
  let service: ActivityLogServiceImpl;
  let activityLogRepository: jest.Mocked<ActivityLogRepository>;
  let matcher: jest.Mocked<ActivityMatcher>;
  let fingerPrintLogsRepository: jest.Mocked<FingerPrintLogsRepository>;
  let activityRepository: jest.Mocked<ActivityRepository>;

  beforeEach(async () => {
    jest.clearAllMocks();
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
          provide: FingerPrintLogsRepository,
          useValue: {
            findLogsOfSixMonth: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(ActivityLogServiceImpl);
    activityRepository = module.get(ActivityRepository);
    activityLogRepository = module.get(
      ActivityLogRepository,
    ) as jest.Mocked<ActivityLogRepository>;
    matcher = module.get(ActivityMatcher) as jest.Mocked<ActivityMatcher>;
    fingerPrintLogsRepository = module.get(
      FingerPrintLogsRepository,
    ) as jest.Mocked<FingerPrintLogsRepository>;
    jest.spyOn(WorkTimeUtils, 'formatDate').mockImplementation((date) => date);
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

  describe('downloadLateReportFile', () => {
    it('should create an Excel report buffer', async () => {
      // Arrange
      const logs: LateReportViewDTO = [
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

  describe('runUserLogComplianceCheck', () => {
    it('creates NOT_FINISHED log entity when user has only 1 log', async () => {
      fingerPrintLogsRepository.findLogsOfSixMonth.mockResolvedValue([
        { deviceUserId: 'user1', recordTime: '2025-01-01T08:00:00Z' },
      ] as any);

      activityRepository.findActivitiesByDeviceUserIds.mockResolvedValue([]);

      await service.runUserLogComplianceCheck();

      const savedLogs = activityLogRepository.updateLogs.mock.calls[0][0];
      expect(savedLogs).toHaveLength(1);
      expect(savedLogs[0]).toMatchObject({
        deviceUserId: 'user1',
        fromTime: '2025-01-01T08:00:00Z',
        toTime: '2025-01-01T08:00:00Z',
        workStatus: LogWorkStatus.NOT_FINISHED,
      });
    });

    it('creates matched log entity when user has exactly 2 logs', async () => {
      fingerPrintLogsRepository.findLogsOfSixMonth.mockResolvedValue([
        { deviceUserId: 'user2', recordTime: '2025-01-01T08:00:00Z' },
        { deviceUserId: 'user2', recordTime: '2025-01-01T17:00:00Z' },
      ] as any);

      activityRepository.findActivitiesByDeviceUserIds.mockResolvedValue([
        { id: 1 } as any,
      ]);

      matcher.match.mockReturnValue({
        status: LogWorkStatus.ON_TIME,
        activityId: 123,
        auditedFromDateTime: undefined,
        auditedToDateTime: undefined,
      });

      await service.runUserLogComplianceCheck();

      const savedLogs = activityLogRepository.updateLogs.mock.calls[0][0];
      expect(savedLogs).toEqual([
        {
          deviceUserId: 'user2',
          fromTime: '2025-01-01T08:00:00Z',
          toTime: '2025-01-01T08:00:00Z',
          workStatus: 'N',
        },
        {
          deviceUserId: 'user2',
          fromTime: '2025-01-01T17:00:00Z',
          toTime: '2025-01-01T17:00:00Z',
          workStatus: 'N',
        },
      ]);
    });

    it('calls updateLogs once per user', async () => {
      fingerPrintLogsRepository.findLogsOfSixMonth.mockResolvedValue([
        { deviceUserId: 'userA', recordTime: '2025-01-01T08:00:00Z' },
        { deviceUserId: 'userB', recordTime: '2025-01-01T08:30:00Z' },
      ] as any);

      activityRepository.findActivitiesByDeviceUserIds.mockResolvedValue([]);
      matcher.match.mockReturnValue({
        status: LogWorkStatus.NOT_FINISHED,
        activityId: null,
        auditedFromDateTime: null,
        auditedToDateTime: null,
      });

      await service.runUserLogComplianceCheck();

      expect(activityLogRepository.updateLogs).toHaveBeenCalledTimes(2);
      const [firstCallArgs] = activityLogRepository.updateLogs.mock.calls[0];
      expect(firstCallArgs[0].deviceUserId).toBe('userA');
      const [secondCallArgs] = activityLogRepository.updateLogs.mock.calls[1];
      expect(secondCallArgs[0].deviceUserId).toBe('userB');
    });
  });
});
