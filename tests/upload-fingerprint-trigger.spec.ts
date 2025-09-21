import { Logger } from '@nestjs/common';
import { WorkLogExtractor } from '../src/activities/work-logs/work-log-extractor'; // assuming you export `main` from your file
import { main } from 'src/upload-fingerprint-trigger';

// --- mocks ---
const mockCreateSocket = jest.fn();
const mockDisconnect = jest.fn();
const mockGetInfo = jest.fn();
const mockGetAttendances = jest.fn();
const mockGetUsers = jest.fn();

jest.mock('node-zklib', () => {
  return jest.fn().mockImplementation(() => ({
    createSocket: mockCreateSocket,
    disconnect: mockDisconnect,
    getInfo: mockGetInfo,
    getAttendances: mockGetAttendances,
    getUsers: mockGetUsers,
  }));
});

const mockSave = jest.fn();
jest.mock('@google-cloud/storage', () => {
  return {
    Storage: jest.fn().mockImplementation(() => ({
      bucket: jest.fn().mockReturnValue({
        file: jest.fn().mockReturnValue({
          save: mockSave,
        }),
      }),
    })),
  };
});

// Spy on Logger.log so it doesn’t spam console
jest.spyOn(Logger, 'log').mockImplementation(() => {});

// Mock extractor
jest.mock('../src/activities/work-logs/work-log-extractor', () => ({
  WorkLogExtractor: {
    extractLogsFromLastHalfYear: jest.fn(),
  },
}));

describe('upload-fingerprint-trigger', () => {
  beforeEach(() => {
    process.exit = jest.fn() as any; // prevent actual exit
  });

  it('should connect, extract logs, and save to GCS', async () => {
    // Arrange
    mockCreateSocket.mockResolvedValue(undefined);
    mockGetInfo.mockResolvedValue({ logCapacity: 100 });
    mockGetAttendances.mockResolvedValue({ data: [{ uid: 1 }] });
    (WorkLogExtractor.extractLogsFromLastHalfYear as jest.Mock).mockReturnValue(
      [{ uid: 1, ts: '2023-01-01' }],
    );
    mockGetUsers.mockResolvedValue([{ uid: 1, name: 'Justin' }]);
    mockSave.mockResolvedValue(undefined);

    // Act
    await main();

    // Assert
    expect(mockCreateSocket).toHaveBeenCalled();
    expect(mockGetInfo).toHaveBeenCalled();
    expect(mockGetAttendances).toHaveBeenCalled();
    expect(WorkLogExtractor.extractLogsFromLastHalfYear).toHaveBeenCalledWith([
      { uid: 1 },
    ]);
    expect(mockSave).toHaveBeenCalledWith(
      JSON.stringify([{ uid: 1, ts: '2023-01-01' }]),
    );
    expect(mockSave).toHaveBeenCalledWith(
      JSON.stringify([{ uid: 1, name: 'Justin' }]),
    );
    expect(mockDisconnect).toHaveBeenCalled();
    expect(process.exit).toHaveBeenCalledWith(0);
  });
});
