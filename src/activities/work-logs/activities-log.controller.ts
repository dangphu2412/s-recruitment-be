import { Controller, Get, Post, Query, StreamableFile } from '@nestjs/common';
import { ActivityLogService } from './activity-log.service';
import { FindLogsRequest } from './dtos/presentation/find-logs.request';
import { CanAccessBy } from '../../account-service/authorization/can-access-by.decorator';
import { Permissions } from '../../account-service/authorization/access-definition.constant';
import {
  FindAnalyticLogRequest,
  FindV2AnalyticLogRequest,
} from './dtos/presentation/find-analytic-log.request';

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

  @Get('/v2/analytics')
  findV2AnalyticLogs(
    @Query() findAnalyticLogRequest: FindV2AnalyticLogRequest,
  ) {
    return this.activityLogService.findV2AnalyticLogs(findAnalyticLogRequest);
  }

  @CanAccessBy(Permissions.WRITE_ACTIVITY_LOGS)
  @Post()
  uploadActivityLogs() {
    return this.activityLogService.uploadActivityLogs();
  }

  @CanAccessBy(Permissions.WRITE_ACTIVITY_LOGS)
  @Post('/reports')
  async downloadReportFile() {
    const fileStream = await this.activityLogService.downloadReportFile();

    return new StreamableFile(fileStream, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      disposition: 'attachment; filename=report.xlsx',
    });
  }
}
