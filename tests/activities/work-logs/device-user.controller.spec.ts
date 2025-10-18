import { Test, TestingModule } from '@nestjs/testing';
import {
  DeviceUserController,
  DeviceUserCRUDService,
} from '../../../src/activities/work-logs/presentation/device-user.controller';
import { ResourceCRUDService } from '../../../src/system/resource-templates/resource-service-template';
import { DeviceUser } from '../../../src/system/database/entities/user-log.entity';
import { OffsetPaginationResponse } from '../../../src/system/pagination';
import { FingerPrintLogsRepository } from '../../../src/activities/work-logs/application/interfaces/finger-print-logs.repository';

describe('DeviceUserController', () => {
  let controller: DeviceUserController;
  let deviceUserService: jest.Mocked<ResourceCRUDService<DeviceUser>>;
  let fingerPrintLogsRepository: jest.Mocked<FingerPrintLogsRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeviceUserController],
      providers: [
        {
          provide: DeviceUserCRUDService.token,
          useValue: {
            find: jest.fn(),
            upsertMany: jest.fn(),
          },
        },
        {
          provide: FingerPrintLogsRepository,
          useValue: {
            findUsers: jest.fn(),
          } as Partial<FingerPrintLogsRepository>,
        },
      ],
    }).compile();

    controller = module.get<DeviceUserController>(DeviceUserController);
    deviceUserService = module.get(DeviceUserCRUDService.token) as jest.Mocked<
      ResourceCRUDService<DeviceUser>
    >;
    fingerPrintLogsRepository = module.get(FingerPrintLogsRepository);
  });

  describe('findDeviceUsers', () => {
    it('should return result from deviceUserService.find', async () => {
      // Arrange
      const expected = {
        items: [{ name: 'name' }],
        metadata: {
          totalPages: 1,
          totalRecords: 100,
          page: 1,
          size: 10,
        },
      } as OffsetPaginationResponse<DeviceUser>;
      jest.spyOn(deviceUserService, 'find').mockResolvedValue(expected);

      // Act
      const result = await controller.findDeviceUsers();

      // Assert
      expect(deviceUserService.find).toHaveBeenCalled();
      expect(result).toEqual(expected);
    });
  });

  describe('uploadTrackFile', () => {
    it('should map valid data to DeviceUser and call upsertMany', async () => {
      // Arrange
      const fakeUsers = [
        { userId: '123', name: 'Alice' },
        { userId: '456', name: 'Bob' },
      ];
      jest
        .spyOn(fingerPrintLogsRepository, 'findUsers')
        .mockResolvedValue(fakeUsers);

      const expectedEntities = fakeUsers.map((u) => {
        const deviceUser = new DeviceUser();
        deviceUser.trackingId = u.userId;
        deviceUser.name = u.name;
        return deviceUser;
      });

      jest.spyOn(deviceUserService, 'upsertMany').mockResolvedValue(undefined);

      // Act
      const result = await controller.runFingerprintSynchronization();

      // Assert
      expect(fingerPrintLogsRepository.findUsers).toHaveBeenCalled();
      expect(deviceUserService.upsertMany).toHaveBeenCalledWith(
        expect.arrayContaining(expectedEntities),
      );
      expect(result).toEqual(undefined);
    });
  });
});
