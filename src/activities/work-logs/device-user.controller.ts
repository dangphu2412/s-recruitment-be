import {
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

export const DeviceUserCRUDService = createCRUDService(DeviceUser);

@Controller('device-users')
export class DeviceUserController {
  constructor(
    @Inject(DeviceUserCRUDService.token)
    private readonly deviceUserService: ResourceCRUDService<DeviceUser>,
  ) {}

  @Get()
  async findDeviceUsers() {
    return this.deviceUserService.find();
  }

  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @Post()
  uploadTrackFile(
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    const data = JSON.parse(file.buffer.toString('utf-8'));

    const entities = data.data.map((item) => {
      const deviceUserLog = new DeviceUser();

      deviceUserLog.trackingId = item.userId;
      deviceUserLog.name = item.name;

      return deviceUserLog;
    });

    return this.deviceUserService.createMany(entities);
  }
}
