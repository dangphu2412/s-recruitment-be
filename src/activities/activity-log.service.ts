import { Injectable } from '@nestjs/common';
import { ActivityLogRepository } from './activity-log.repository';
import { FindLogsRequest } from './domain/presentation/dtos/find-logs.request';
import { subYears } from 'date-fns';
import { Page } from '../system/query-shape/dto';

@Injectable()
export class ActivityLogService {
  constructor(private readonly activityLogRepository: ActivityLogRepository) {}

  async findLogs(findLogsRequest: FindLogsRequest) {
    const [items, totalRecords] =
      await this.activityLogRepository.findLogs(findLogsRequest);

    return Page.of({
      items,
      totalRecords,
      query: findLogsRequest,
    });
  }

  findAnalyticLogs() {
    return this.activityLogRepository.findAnalyticLogs({
      fromDate: subYears(new Date(), 1).toISOString(),
      toDate: new Date().toISOString(),
    });
  }
}
