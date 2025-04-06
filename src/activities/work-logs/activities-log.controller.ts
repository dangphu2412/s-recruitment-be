import {
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ActivityLogService } from './activity-log.service';
import { FindLogsRequest } from '../domain/presentation/dtos/find-logs.request';
import { CanAccessBy } from '../../account-service/authorization/can-access-by.decorator';
import { Permissions } from '../../account-service/authorization/access-definition.constant';
import { FileInterceptor } from '../../system/file';
import { ApiConsumes } from '@nestjs/swagger';
import { FindAnalyticLogRequest } from './dtos/presentation/find-analytic-log.request';

@Controller('activity-logs')
export class ActivitiesLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  @CanAccessBy(Permissions.READ_ACTIVITY_LOGS)
  @Get()
  findLogs(@Query() findLogsRequest: FindLogsRequest) {
    return this.activityLogService.findLogs(findLogsRequest);
  }

  @Get('analytics')
  findAnalyticLogs(@Query() findAnalyticLogRequest: FindAnalyticLogRequest) {
    return this.activityLogService.findAnalyticLogs(findAnalyticLogRequest);
  }

  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @Post()
  uploadTrackFile(
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    return this.activityLogService.uploadActivityLogs(file);
  }
}
