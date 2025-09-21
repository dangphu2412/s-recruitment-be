import {
  BadRequestException,
  Controller,
  Get,
  Inject,
  Post,
} from '@nestjs/common';
import {
  createCRUDService,
  ResourceCRUDService,
} from '../../system/resource-templates/resource-service-template';
import { DeviceUser } from '../../system/database/entities/user-log.entity';
import { CanAccessBy } from '../../account-service/authorization/can-access-by.decorator';
import { Permissions } from '../../account-service/authorization/access-definition.constant';
import { LogFileService } from './log-file.service';

export const DeviceUserCRUDService = createCRUDService(DeviceUser);

@Controller('device-users')
export class DeviceUserController {
  constructor(
    @Inject(DeviceUserCRUDService.token)
    private readonly deviceUserService: ResourceCRUDService<DeviceUser>,
    private readonly logFileService: LogFileService,
  ) {}

  @CanAccessBy(Permissions.READ_FINGERPRINT_USERS)
  @Get()
  async findDeviceUsers() {
    return this.deviceUserService.find();
  }

  @CanAccessBy(Permissions.WRITE_FINGERPRINT_USERS)
  @Post()
  async uploadTrackFile() {
    const data = JSON.parse(
      (await this.logFileService.getUsers()).toString('utf-8'),
    );

    if (!data.data) {
      throw new BadRequestException('Invalid data format');
    }

    const firstItem = data.data[0];

    if (firstItem.userId === undefined || firstItem.name === undefined) {
      throw new BadRequestException('Invalid data format');
    }

    const entities = data.data.map((item) => {
      const deviceUserLog = new DeviceUser();

      deviceUserLog.trackingId = item.userId;
      deviceUserLog.name = item.name;

      return deviceUserLog;
    });

    return this.deviceUserService.upsertMany(entities);
  }
}
