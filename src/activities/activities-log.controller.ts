import { Controller, Get, Query } from '@nestjs/common';
import { ActivityLogService } from './activity-log.service';
import { FindLogsRequest } from './domain/presentation/dtos/find-logs.request';

@Controller('activity-logs')
export class ActivitiesLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  @Get()
  findLogs(@Query() findLogsRequest: FindLogsRequest) {
    return this.activityLogService.findLogs(findLogsRequest);
  }

  @Get('analytics')
  findAnalyticLogs() {
    return this.activityLogService.findAnalyticLogs();
  }
}
