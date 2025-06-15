import {
  BadRequestException,
  Controller,
  Get,
  Inject,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  createCRUDService,
  ResourceCRUDService,
} from '../../system/resource-templates/resource-service-template';
import { DeviceUser } from '../domain/data-access/user-log.entity';
import { FileInterceptor } from '../../system/file';
import { ApiConsumes } from '@nestjs/swagger';
import { DeviceUserFileValidatorPipe } from './device-user-file.pipe';
import { CanAccessBy } from '../../account-service/authorization/can-access-by.decorator';
import { Permissions } from '../../account-service/authorization/access-definition.constant';

export const DeviceUserCRUDService = createCRUDService(DeviceUser);

@Controller('device-users')
export class DeviceUserController {
  constructor(
    @Inject(DeviceUserCRUDService.token)
    private readonly deviceUserService: ResourceCRUDService<DeviceUser>,
  ) {}

  @CanAccessBy(Permissions.READ_FINGERPRINT_USERS)
  @Get()
  async findDeviceUsers() {
    return this.deviceUserService.find();
  }

  @CanAccessBy(Permissions.WRITE_FINGERPRINT_USERS)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @Post()
  uploadTrackFile(
    @UploadedFile(new DeviceUserFileValidatorPipe())
    file: Express.Multer.File,
  ) {
    const data = JSON.parse(file.buffer.toString('utf-8'));

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

    return this.deviceUserService.createMany(entities);
  }
}
