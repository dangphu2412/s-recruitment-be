import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import {
  DeviceUserController,
  DeviceUserCRUDService,
} from '../../../src/activities/work-logs/device-user.controller';
import { ResourceCRUDService } from '../../../src/system/resource-templates/resource-service-template';
import { DeviceUser } from '../../../src/system/database/entities/user-log.entity';
import { LogFileService } from '../../../src/activities/work-logs/log-file.service';
import { OffsetPaginationResponse } from '../../../src/system/pagination';

describe('DeviceUserController', () => {
  let controller: DeviceUserController;
  let deviceUserService: jest.Mocked<ResourceCRUDService<DeviceUser>>;
  let logFileService: jest.Mocked<LogFileService>;

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
          provide: LogFileService,
          useValue: {
            getUsers: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<DeviceUserController>(DeviceUserController);
    deviceUserService = module.get(DeviceUserCRUDService.token) as jest.Mocked<
      ResourceCRUDService<DeviceUser>
    >;
    logFileService = module.get(LogFileService) as jest.Mocked<LogFileService>;
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
      const fakeUsers = {
        data: [
          { userId: '123', name: 'Alice' },
          { userId: '456', name: 'Bob' },
        ],
      };
      const buffer = Buffer.from(JSON.stringify(fakeUsers));
      jest.spyOn(logFileService, 'getUsers').mockResolvedValue(buffer);

      const expectedEntities = fakeUsers.data.map((u) => {
        const deviceUser = new DeviceUser();
        deviceUser.trackingId = u.userId;
        deviceUser.name = u.name;
        return deviceUser;
      });

      jest.spyOn(deviceUserService, 'upsertMany').mockResolvedValue(undefined);

      // Act
      const result = await controller.uploadTrackFile();

      // Assert
      expect(logFileService.getUsers).toHaveBeenCalled();
      expect(deviceUserService.upsertMany).toHaveBeenCalledWith(
        expect.arrayContaining(expectedEntities),
      );
      expect(result).toEqual(undefined);
    });

    it('should throw BadRequestException if data property is missing', async () => {
      // Arrange
      const buffer = Buffer.from(JSON.stringify({ foo: 'bar' }));
      jest.spyOn(logFileService, 'getUsers').mockResolvedValue(buffer);

      // Act + Assert
      await expect(controller.uploadTrackFile()).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if userId or name is missing', async () => {
      // Arrange
      const badUsers = { data: [{ userId: '123' }] }; // missing name
      const buffer = Buffer.from(JSON.stringify(badUsers));
      jest.spyOn(logFileService, 'getUsers').mockResolvedValue(buffer);

      // Act + Assert
      await expect(controller.uploadTrackFile()).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
