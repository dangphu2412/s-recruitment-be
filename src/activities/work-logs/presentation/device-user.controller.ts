import { Controller, Get, Inject, Post } from '@nestjs/common';
import {
  createCRUDService,
  ResourceCRUDService,
} from '../../../system/resource-templates/resource-service-template';
import { DeviceUser } from '../../../system/database/entities/user-log.entity';
import { CanAccessBy } from '../../../account-service/authorization/can-access-by.decorator';
import { Permissions } from '../../../account-service/authorization/access-definition.constant';
import { FingerPrintLogsRepository } from '../application/interfaces/finger-print-logs.repository';

export const DeviceUserCRUDService = createCRUDService(DeviceUser);

@Controller('device-users')
export class DeviceUserController {
  constructor(
    @Inject(DeviceUserCRUDService.token)
    private readonly deviceUserService: ResourceCRUDService<DeviceUser>,
    @Inject(FingerPrintLogsRepository)
    private readonly fingerPrintLogsRepository: FingerPrintLogsRepository,
  ) {}

  @CanAccessBy(Permissions.READ_FINGERPRINT_USERS)
  @Get()
  async findDeviceUsers() {
    return this.deviceUserService.find();
  }

  @CanAccessBy(Permissions.WRITE_FINGERPRINT_USERS)
  @Post()
  async runFingerprintSynchronization() {
    const fingerPrintUserViewItemDTOS =
      await this.fingerPrintLogsRepository.findUsers();

    const entities = fingerPrintUserViewItemDTOS.map((item) => {
      const deviceUserLog = new DeviceUser();

      deviceUserLog.trackingId = item.userId;
      deviceUserLog.name = item.name;

      return deviceUserLog;
    });

    return this.deviceUserService.upsertMany(entities);
  }
}
