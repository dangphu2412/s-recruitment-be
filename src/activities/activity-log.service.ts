import { Injectable, Logger } from '@nestjs/common';
import { ActivityLogRepository } from './activity-log.repository';
import { FindLogsRequest } from './domain/presentation/dtos/find-logs.request';
import { compareAsc, format, parse, subYears } from 'date-fns';
import { Page } from '../system/query-shape/dto';
import {
  CreateFileDTO,
  LogDTO,
} from '../file-service/domain/core/dto/file.dto';
import { Activity } from './domain/data-access/activity.entity';
import { RequestTypes } from './domain/core/constants/request-activity-status.enum';
import { ActivityRepository } from './activity.repository';
import { LogWorkStatus } from './domain/core/constants/log-work-status.enum';
import { ActivityLog } from './domain/data-access/activity-log.entity';

class LogSegmentProcessor {
  private deviceIdMapToDateSegmentedLogs: Map<string, Map<string, LogDTO[]>> =
    new Map();

  constructor(logs: LogDTO[]) {
    for (const log of logs) {
      const dateId = format(new Date(log.recordTime), 'yyyy-MM-dd');

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

class WorkStatusPolicy {
  constructor(
    private activities: Activity[],
    private fromDateTime: string,
    private toDateTime: string,
  ) {}

  private getHHMMSS(time: string) {
    return this.parseTime(
      new Date(time).getUTCHours().toString().padStart(2, '0') +
        ':' +
        new Date(time).getUTCMinutes().toString().padStart(2, '0') +
        ':' +
        new Date(time).getUTCSeconds().toString().padStart(2, '0'),
    );
  }

  private parseTime(time: string) {
    return parse(time, 'HH:mm:ss', new Date());
  }

  check(): LogWorkStatus {
    if (this.activities.length === 0) {
      return LogWorkStatus.NOT_FINISHED;
    }

    for (const workActivity of this.activities) {
      if (workActivity.requestType !== RequestTypes.WORKING) {
        continue;
      }

      // Ensure work activity day matches the log date
      if (
        parseInt(workActivity.dayOfWeek.id) !==
        new Date(this.fromDateTime).getUTCDay()
      ) {
        continue;
      }

      // Convert registered working hours
      const workStart = this.parseTime(workActivity.timeOfDay.fromTime);
      const workEnd = this.parseTime(workActivity.timeOfDay.toTime);

      // Convert log time
      const logStart = this.getHHMMSS(this.fromDateTime);
      const logEnd = this.getHHMMSS(this.toDateTime);

      // Check if the log time overlaps with the defined work time
      if (
        compareAsc(logEnd, workStart) >= 0 &&
        compareAsc(logStart, workEnd) <= 0
      ) {
        return LogWorkStatus.ON_TIME;
      }
    }

    return LogWorkStatus.LATE;
  }
}

@Injectable()
export class ActivityLogService {
  constructor(
    private readonly activityLogRepository: ActivityLogRepository,
    private readonly activityRepository: ActivityRepository,
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
            log.workStatus = new WorkStatusPolicy(
              workActivities,
              userLogs[0].recordTime,
              userLogs[1].recordTime,
            ).check();
            log.deviceUserId = deviceUserId;
            logEntities.push(log);
            return;
          }

          // More than 2 logsByUserDeviceId
          log.fromTime = userLogs[0].recordTime;
          log.toTime = userLogs[userLogs.length - 1].recordTime;
          log.workStatus = new WorkStatusPolicy(
            workActivities,
            userLogs[0].recordTime,
            userLogs[userLogs.length - 1].recordTime,
          ).check();
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
