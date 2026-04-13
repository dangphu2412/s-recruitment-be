import { subMonths, format } from 'date-fns';
import { WorkTimeUtils } from '../../../src/activities/work-logs/application/work-status-evaluator.service';
import { WorkLogExtractor } from '../../../src/activities/work-logs/infras/work-log-extractor';

jest.mock('date-fns', () => ({
  subMonths: jest.fn(),
  format: jest.fn(),
}));

type LogDTO = {
  userSn: number;
  deviceUserId: string;
  recordTime: string;
};

describe('WorkLogExtractor', () => {
  // Use a fixed cutoff date for deterministic tests
  const MOCK_CUTOFF_DATE = '2025-01-01';

  beforeEach(() => {
    // Mock subMonths to return a fixed date object
    (subMonths as jest.Mock).mockReturnValue(new Date('2025-01-01'));
    // Mock format to always return the cutoff string
    (format as jest.Mock).mockReturnValue(MOCK_CUTOFF_DATE);

    jest.spyOn(WorkTimeUtils, 'formatDate');
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should return all logs when all are within the last 6 months', () => {
    // Arrange
    const logs: LogDTO[] = [
      { userSn: 1, deviceUserId: 'A', recordTime: '2025-06-01' },
      { userSn: 2, deviceUserId: 'B', recordTime: '2025-07-01' },
    ];
    (WorkTimeUtils.formatDate as jest.Mock).mockImplementation(
      (date: string) => date,
    );

    // Act
    const result = WorkLogExtractor.extractLogsFromLastHalfYear(logs);

    // Assert
    expect(result).toEqual(logs);
  });

  it('should return only logs newer than the cutoff date', () => {
    // Arrange
    const logs: LogDTO[] = [
      { userSn: 1, deviceUserId: 'A', recordTime: '2023-01-01' },
      { userSn: 2, deviceUserId: 'B', recordTime: '2025-01-01' },
      { userSn: 3, deviceUserId: 'C', recordTime: '2025-07-01' },
    ];
    (WorkTimeUtils.formatDate as jest.Mock).mockImplementation(
      (date: string) => date,
    );

    // Act
    const result = WorkLogExtractor.extractLogsFromLastHalfYear(logs);

    // Assert
    expect(result.every((log) => log.recordTime >= MOCK_CUTOFF_DATE)).toBe(
      true,
    );
    expect(result).toEqual([
      { userSn: 2, deviceUserId: 'B', recordTime: '2025-01-01' },
      { userSn: 3, deviceUserId: 'C', recordTime: '2025-07-01' },
    ]);
  });

  it('should return empty array if all logs are older than cutoff', () => {
    // Arrange
    const logs: LogDTO[] = [
      { userSn: 1, deviceUserId: 'A', recordTime: '2020-01-01' },
      { userSn: 2, deviceUserId: 'B', recordTime: '2021-06-01' },
    ];
    (WorkTimeUtils.formatDate as jest.Mock).mockImplementation(
      (date: string) => date,
    );

    // Act
    const result = WorkLogExtractor.extractLogsFromLastHalfYear(logs);

    // Assert
    expect(result).toEqual([]);
  });

  it('should handle empty logs array', () => {
    // Arrange
    const logs: LogDTO[] = [];
    (WorkTimeUtils.formatDate as jest.Mock).mockImplementation(
      (date: string) => date,
    );

    // Act
    const result = WorkLogExtractor.extractLogsFromLastHalfYear(logs);

    // Assert
    expect(result).toEqual([]);
  });
});
