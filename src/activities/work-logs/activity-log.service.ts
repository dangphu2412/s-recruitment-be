import { Injectable, Logger } from '@nestjs/common';
import { ActivityLogRepository } from './activity-log.repository';
import { FindLogsRequest } from '../domain/presentation/dtos/find-logs.request';
import { format, subYears } from 'date-fns';
import { Page } from '../../system/query-shape/dto';
import {
  CreateFileDTO,
  LogDTO,
} from '../../file-service/domain/core/dto/file.dto';
import { ActivityRepository } from '../managements/activity.repository';
import { LogWorkStatus } from '../domain/core/constants/log-work-status.enum';
import { ActivityLog } from '../domain/data-access/activity-log.entity';
import {
  WorkStatusEvaluator,
  WorkTimeUtils,
} from './work-status-evaluator.service';

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
    Logger.log(
      `Proces logs for users size of ${this.deviceIdMapToDateSegmentedLogs.size}`,
      LogSegmentProcessor.name,
    );

    for (const [
      deviceId,
      logs,
    ] of this.deviceIdMapToDateSegmentedLogs.entries()) {
      Logger.log(
        `Process on user ${deviceId} with logs size of ${logs.size}`,
        LogSegmentProcessor.name,
      );
      await callback(deviceId, logs);
      Logger.log(`Finished on user ${deviceId}`, LogSegmentProcessor.name);
    }
  }
}

@Injectable()
export class ActivityLogService {
  constructor(
    private readonly activityLogRepository: ActivityLogRepository,
    private readonly activityRepository: ActivityRepository,
    private readonly workStatusEvaluator: WorkStatusEvaluator,
  ) {}

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

  async uploadActivityLogs(file: CreateFileDTO) {
    const data = file.buffer.toString('utf-8');
    const fullLogs = JSON.parse(data) as LogDTO[];

    const lastYearLogs = this.extractLogsFromLastYear(fullLogs);
    const logSegmentProcessor = new LogSegmentProcessor(lastYearLogs);

    await logSegmentProcessor.onEachDeviceUserId(
      async (deviceUserId: string, dateMapToLogs: Map<string, LogDTO[]>) => {
        const workActivities =
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
            // Logs keep order so we do not care about from Time and to Time
            log.fromTime = userLogs[0].recordTime;
            log.toTime = userLogs[1].recordTime;
            log.workStatus = this.workStatusEvaluator.evaluateStatus({
              activities: workActivities,
              fromDateTime: userLogs[0].recordTime,
              toDateTime: userLogs[1].recordTime,
            });
            log.deviceUserId = deviceUserId;
            logEntities.push(log);
            return;
          }

          // More than 2 logsByUserDeviceId
          log.fromTime = userLogs[0].recordTime;
          log.toTime = userLogs[userLogs.length - 1].recordTime;
          log.workStatus = this.workStatusEvaluator.evaluateStatus({
            activities: workActivities,
            fromDateTime: userLogs[0].recordTime,
            toDateTime: userLogs[1].recordTime,
          });
          log.deviceUserId = deviceUserId;
        });

        Logger.log(
          `Update logs for user ${deviceUserId} with size ${logEntities.length}`,
          ActivityLogService.name,
        );
        await this.activityLogRepository.updateLogs(logEntities);
      },
    );
  }

  /**
   * Apply binary search to find logs from the previous year
   */
  private extractLogsFromLastYear(logs: LogDTO[]) {
    const START_OF_PREVIOUS_YEAR = format(
      subYears(new Date(), 1),
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
}
