import { Injectable } from '@nestjs/common';
import { ActivityLogRepository } from './activity-log.repository';
import { FindLogsRequest } from './domain/presentation/dtos/find-logs.request';
import { format, subYears } from 'date-fns';
import { Page } from '../system/query-shape/dto';
import {
  CreateFileDTO,
  LogDTO,
} from '../file-service/domain/core/dto/file.dto';
import { Activity } from './domain/data-access/activity.entity';
import { RequestTypes } from './domain/core/constants/request-activity-status.enum';
import { ActivityLog } from './domain/data-access/activity-log.entity';
import { ActivityRepository } from './activity.repository';
import { LogWorkStatus } from './domain/core/constants/log-work-status.enum';

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
    const activities = await this.activityRepository.find({
      relations: ['author', 'dayOfWeek', 'timeOfDay'],
    });
    const deviceUserIdToActivities: Record<string, Activity[]> =
      activities.reduce((result, activity) => {
        if (!result[activity.author.trackingId]) {
          result[activity.author.trackingId] = [];
        }
        result[activity.author.trackingId].push(activity);
        return result;
      }, {});

    const data = file.buffer.toString('utf-8');
    const logs = JSON.parse(data) as LogDTO[];

    const chunks: Array<Array<LogDTO>> = [];

    let chunkPool: Array<LogDTO> = [];
    let chunkId: null | string = null;

    for (const log of logs) {
      const currentChunkId = format(new Date(log.recordTime), 'yyyy-MM-dd');

      if (currentChunkId < '2022-01-01') {
        continue;
      }

      if (chunkId === null) {
        chunkId = currentChunkId;
      }

      if (chunkId === currentChunkId) {
        chunkPool.push(log);
      } else {
        chunks.push(chunkPool);
        chunkPool = [log];
        chunkId = currentChunkId;
      }
    }

    // Sort the chunks by the recordTime of the first log in the chunk
    chunks.sort((a, b) => {
      return (
        new Date(b[0].recordTime).getTime() -
        new Date(a[0].recordTime).getTime()
      );
    });

    for (const logsOfDay of chunks) {
      /**
       * Group the logs by deviceUserId
       * With each userId, identify the start and end of the activity
       * Detect if the activity is on time or not by compare to the registered activity
       */
      const deviceUserIdMapToLogs = {};

      logsOfDay.forEach((log) => {
        if (!deviceUserIdMapToLogs[log.deviceUserId]) {
          deviceUserIdMapToLogs[log.deviceUserId] = [];
        }

        deviceUserIdMapToLogs[log.deviceUserId].push(log);
      });

      const newLogs = Object.keys(deviceUserIdMapToLogs)
        .map((deviceUserId) => {
          const logs: LogDTO[] = deviceUserIdMapToLogs[deviceUserId];
          const activities = deviceUserIdToActivities[deviceUserId] ?? [];
          const workActivities = activities.filter(
            (activity) => activity.requestType === RequestTypes.WORKING,
          );
          const lateActivities = activities.filter(
            (activity) => activity.requestType === RequestTypes.LATE,
          );
          const absenseActivities = activities.filter(
            (activity) => activity.requestType === RequestTypes.ABSENCE,
          );

          if (logs.length === 1) {
            const entity = new ActivityLog();
            entity.deviceUserId = deviceUserId;
            entity.fromTime = logs[0].recordTime;
            entity.toTime = logs[0].recordTime;
            entity.workStatus = LogWorkStatus.NOT_FINISHED;
            return entity;
          }

          if (logs.length === 2) {
            const entity = new ActivityLog();
            entity.deviceUserId = deviceUserId;
            entity.fromTime = logs[0].recordTime;
            entity.toTime = logs[1].recordTime;
            entity.workStatus = LogWorkStatus.NOT_FINISHED;

            if (entity.fromTime > entity.toTime) {
              const temp = entity.toTime;
              entity.toTime = entity.fromTime;
              entity.fromTime = temp;
            }

            if (workActivities.length !== 0) {
              const workActivity = workActivities[0];
              entity.workStatus =
                entity.fromTime > workActivity.timeOfDay.fromTime
                  ? LogWorkStatus.ON_TIME
                  : LogWorkStatus.LATE;
            } else if (lateActivities.length !== 0) {
              const lateActivity = lateActivities[0];
              entity.workStatus =
                entity.fromTime > lateActivity.timeOfDay.fromTime
                  ? LogWorkStatus.ON_TIME
                  : LogWorkStatus.LATE;
            } else if (absenseActivities.length !== 0) {
              entity.workStatus = LogWorkStatus.LATE;
            }

            return entity;
          }

          console.log('NOT SUPPORT WITH MORE THAN 2 LOGS');
          return null;
        })
        .filter(Boolean);

      await this.activityLogRepository.updateLogs(newLogs);
    }
  }

  async syncLogs() {
    const logs = await this.activityLogRepository.find({
      where: {
        workStatus: LogWorkStatus.NOT_FINISHED,
      },
    });

    const activities = await this.activityRepository.find({
      relations: ['author', 'dayOfWeek', 'timeOfDay'],
    });

    const deviceUserIdToActivities: Record<string, Activity[]> =
      activities.reduce((result, activity) => {
        if (!result[activity.author.trackingId]) {
          result[activity.author.trackingId] = [];
        }
        result[activity.author.trackingId].push(activity);
        return result;
      }, {});

    for (const log of logs) {
      const activities = deviceUserIdToActivities[log.deviceUserId] ?? [];
      const workActivities = activities.filter(
        (activity) => activity.requestType === RequestTypes.WORKING,
      );
      const lateActivities = activities.filter(
        (activity) => activity.requestType === RequestTypes.LATE,
      );
      const absenseActivities = activities.filter(
        (activity) => activity.requestType === RequestTypes.ABSENCE,
      );

      if (workActivities.length !== 0) {
        const workActivity = workActivities[0];
        log.workStatus =
          log.fromTime > workActivity.timeOfDay.fromTime
            ? LogWorkStatus.ON_TIME
            : LogWorkStatus.LATE;
      } else if (lateActivities.length !== 0) {
        const lateActivity = lateActivities[0];
        log.workStatus =
          log.fromTime > lateActivity.timeOfDay.fromTime
            ? LogWorkStatus.ON_TIME
            : LogWorkStatus.LATE;
      } else if (absenseActivities.length !== 0) {
        log.workStatus = LogWorkStatus.LATE;
      }
    }

    await this.activityLogRepository.save(logs);
  }
}
