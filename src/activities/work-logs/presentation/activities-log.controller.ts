import {
  Controller,
  Get,
  Inject,
  Post,
  Query,
  StreamableFile,
} from '@nestjs/common';
import { FindLogsRequest } from './dtos/find-logs.request';
import { CanAccessBy } from '../../../account-service/authorization/can-access-by.decorator';
import { Permissions } from '../../../account-service/authorization/access-definition.constant';
import { ActivityLogService } from '../application/interfaces/activity-log.service';

@Controller('activity-logs')
export class ActivitiesLogController {
  constructor(
    @Inject(ActivityLogService)
    private readonly activityLogService: ActivityLogService,
  ) {}

  @CanAccessBy(Permissions.READ_ACTIVITY_LOGS)
  @Get()
  findLogs(@Query() findLogsRequest: FindLogsRequest) {
    return this.activityLogService.findLogs(findLogsRequest);
  }

  @CanAccessBy(Permissions.WRITE_ACTIVITY_LOGS)
  @Post()
  runUserLogComplianceCheck() {
    return this.activityLogService.runUserLogComplianceCheck();
  }

  @CanAccessBy(Permissions.WRITE_ACTIVITY_LOGS)
  @Post('/reports')
  async downloadReportFile() {
    const fileStream = await this.activityLogService.downloadLateReportFile();

    return new StreamableFile(fileStream, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      disposition: 'attachment; filename=report.xlsx',
    });
  }
}
