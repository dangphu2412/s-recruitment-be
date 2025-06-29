import { Injectable, Logger } from '@nestjs/common';
import { ActivityLogRepository } from './activity-log.repository';
import { FindLogsRequest } from './dtos/presentation/find-logs.request';
import {
  format,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subMonths,
  subWeeks,
} from 'date-fns';
import { OffsetPaginationResponse } from '../../system/pagination';
import { ActivityRepository } from '../managements/activity.repository';
import { LogWorkStatus } from './log-work-status.enum';
import { ActivityLog } from '../shared/entities/activity-log.entity';
import {
  ActivityMatcher,
  WorkTimeUtils,
} from './work-status-evaluator.service';
import {
  FindAnalyticLogRequest,
  FindV2AnalyticLogRequest,
  FindV2AnalyticLogResponse,
  GroupType,
} from './dtos/presentation/find-analytic-log.request';
import { LogFileService } from './log-file.service';
import { utils, write } from 'xlsx';

export type LogDTO = {
  userSn: number;
  deviceUserId: string;
  recordTime: string;
};

class LogSegmentProcessor {
  private deviceIdMapToDateSegmentedLogs: Map<string, Map<string, LogDTO[]>> =
    new Map();

  constructor(logs: LogDTO[]) {
    for (const log of logs) {
      const dateId = WorkTimeUtils.formatDate(log.recordTime);

      if (!this.deviceIdMapToDateSegmentedLogs.has(log.deviceUserId)) {
        this.deviceIdMapToDateSegmentedLogs.set(log.deviceUserId, new Map());
      }

      const dateSegmentedLogs = this.deviceIdMapToDateSegmentedLogs.get(
        log.deviceUserId,
      );

      if (!dateSegmentedLogs.has(dateId)) {
        dateSegmentedLogs.set(dateId, []);
      }

      dateSegmentedLogs.get(dateId).push(log);
    }
  }

  async onEachDeviceUserId(
    callback: (deviceId: string, logs: Map<string, LogDTO[]>) => Promise<void>,
  ) {
    for (const [
      deviceId,
      logs,
    ] of this.deviceIdMapToDateSegmentedLogs.entries()) {
      await callback(deviceId, logs);
    }
  }

  getDeviceIds(): string[] {
    return [...this.deviceIdMapToDateSegmentedLogs.keys()];
  }
}

@Injectable()
export class ActivityLogService {
  private logger = new Logger(ActivityLogService.name);

  constructor(
    private readonly activityLogRepository: ActivityLogRepository,
    private readonly activityRepository: ActivityRepository,
    private readonly workStatusEvaluator: ActivityMatcher,
    private readonly logFileService: LogFileService,
  ) {}

  async findLogs(findLogsRequest: FindLogsRequest) {
    const [items, totalRecords] =
      await this.activityLogRepository.findLogs(findLogsRequest);

    return OffsetPaginationResponse.of({
      items,
      totalRecords,
      query: findLogsRequest,
    });
  }

  findAnalyticLogs(findAnalyticLogRequest: FindAnalyticLogRequest) {
    const {
      fromDate = subWeeks(new Date(), 1).toISOString(),
      toDate = new Date().toISOString(),
    } = findAnalyticLogRequest;

    return this.activityLogRepository.findAnalyticLogs({
      fromDate,
      toDate,
    });
  }

  async findV2AnalyticLogs({
    groupType,
  }: FindV2AnalyticLogRequest): Promise<FindV2AnalyticLogResponse> {
    function getTimeSeriesFilter() {
      if (groupType === GroupType.MONTHLY) {
        return {
          fromDate: startOfMonth(new Date()).toISOString(),
          toDate: new Date().toISOString(),
        };
      }

      if (groupType === GroupType.YEARLY) {
        return {
          fromDate: startOfYear(new Date()).toISOString(),
          toDate: new Date().toISOString(),
        };
      }

      return {
        fromDate: startOfWeek(subWeeks(new Date(), 1)).toISOString(),
        toDate: new Date().toISOString(),
      };
    }

    const items = await this.activityLogRepository.findV2AnalyticLogs({
      ...getTimeSeriesFilter(),
      groupType,
    });

    return {
      items,
    };
  }

  async uploadActivityLogs() {
    const data = (await this.logFileService.getLogs()).toString('utf-8');
    const fullLogs = JSON.parse(data) as LogDTO[];

    const lastYearLogs = this.extractLogsFromLastHalfYear(fullLogs);
    const logSegmentProcessor = new LogSegmentProcessor(lastYearLogs);

    await logSegmentProcessor.onEachDeviceUserId(
      async (deviceUserId: string, dateMapToLogs: Map<string, LogDTO[]>) => {
        const activities =
          await this.activityRepository.findActivitiesByDeviceUserIds([
            deviceUserId,
          ]);
        const logEntities: ActivityLog[] = [];

        dateMapToLogs.forEach((userLogs) => {
          const log = new ActivityLog();

          if (userLogs.length === 1) {
            log.fromTime = userLogs[0].recordTime;
            log.toTime = userLogs[0].recordTime;
            log.workStatus = LogWorkStatus.NOT_FINISHED;
            log.deviceUserId = deviceUserId;
            logEntities.push(log);
            return;
          }

          if (userLogs.length === 2) {
            const {
              status,
              activityId,
              auditedToDateTime,
              auditedFromDateTime,
            } = this.workStatusEvaluator.match({
              activities: activities,
              fromDateTime: userLogs[0].recordTime,
              toDateTime: userLogs[1].recordTime,
            });
            log.fromTime = userLogs[0].recordTime;
            log.toTime = userLogs[1].recordTime;
            log.workStatus = status;
            log.deviceUserId = deviceUserId;
            log.activityId = activityId;
            log.auditedFromTime = auditedFromDateTime?.toISOString();
            log.auditedToTime = auditedToDateTime?.toISOString();
            logEntities.push(log);
            return;
          }

          const { status, activityId, auditedToDateTime, auditedFromDateTime } =
            this.workStatusEvaluator.match({
              activities: activities,
              fromDateTime: userLogs[0].recordTime,
              toDateTime: userLogs[1].recordTime,
            });

          // More than 2 logsByUserDeviceId
          log.fromTime = userLogs[0].recordTime;
          log.activityId = activityId;
          log.toTime = userLogs[userLogs.length - 1].recordTime;
          log.workStatus = status;
          log.deviceUserId = deviceUserId;
          log.auditedFromTime = auditedFromDateTime?.toISOString();
          log.auditedToTime = auditedToDateTime?.toISOString();
        });

        await this.activityLogRepository.updateLogs(logEntities);
      },
    );

    this.logger.log(
      `Finished process: ${logSegmentProcessor.getDeviceIds().toString()}`,
    );
  }

  /**
   * Apply binary search to find logs from the previous year
   */
  private extractLogsFromLastHalfYear(logs: LogDTO[]) {
    const START_OF_PREVIOUS_YEAR = format(
      subMonths(new Date(), 6),
      'yyyy-MM-dd',
    );
    let left = 0;
    let right = logs.length - 1;
    let result = logs.length;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);

      if (logs[mid].recordTime >= START_OF_PREVIOUS_YEAR) {
        result = mid;
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    }

    return logs.slice(result);
  }

  async downloadReportFile(): Promise<Buffer> {
    const reportLogs = await this.activityLogRepository.findLateReportLogs();

    const data = reportLogs.map((log) => {
      return {
        email: log.email,
        fullName: log.fullName,
        lateCount: log.lateCount,
      };
    });
    const worksheet = utils.json_to_sheet(data);

    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, 'Reports');

    return write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }
}
