import { Injectable } from '@nestjs/common';
import { ActivityService } from './domain/core/services/activity.service';
import { CreateActivityDTO } from './domain/core/dtos/create-activity.dto';
import {
  FindActivitiesDTO,
  FindActivitiesResponseDTO,
} from './domain/core/dtos/find-activities.dto';
import { ActivityRepository } from './activity.repository';
import { CreateFileDTO } from '../file-service/domain/core/dto/file.dto';
import { ActivityLogRepository } from './activity-log.repository';
import { format } from 'date-fns';
import { ActivityLog } from './domain/data-access/activity-log.entity';
import { Activity } from './domain/data-access/activity.entity';
import { RequestTypes } from './domain/core/constants/request-activity-status.enum';

type LogDTO = {
  userSn: number;
  deviceUserId: string;
  recordTime: string;
};

@Injectable()
export class ActivityServiceImpl implements ActivityService {
  constructor(
    private readonly activityRepository: ActivityRepository,
    private readonly activityLogRepository: ActivityLogRepository,
  ) {}

  findActivities(dto: FindActivitiesDTO): Promise<FindActivitiesResponseDTO> {
    return this.activityRepository.findActivities(dto);
  }

  async createActivity(dto: CreateActivityDTO): Promise<void> {
    await this.activityRepository.insert(dto);
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
            entity.isLate = false;
            return entity;
          }

          if (logs.length === 2) {
            const entity = new ActivityLog();
            entity.deviceUserId = deviceUserId;
            entity.fromTime = logs[0].recordTime;
            entity.toTime = logs[1].recordTime;

            if (entity.fromTime > entity.toTime) {
              const temp = entity.toTime;
              entity.toTime = entity.fromTime;
              entity.fromTime = temp;
            }

            if (workActivities.length !== 0) {
              const workActivity = workActivities[0];
              entity.isLate = entity.fromTime > workActivity.timeOfDay.fromTime;
            } else if (lateActivities.length !== 0) {
              const lateActivity = lateActivities[0];
              entity.isLate = entity.fromTime > lateActivity.timeOfDay.fromTime;
            } else if (absenseActivities.length !== 0) {
              entity.isLate = true;
            }

            return entity;
          }

          console.log('NOT SUPPORT WITH MORE THAN 2 LOGS');
          return null;
        })
        .filter(Boolean);

      await this.activityLogRepository.save(newLogs);
    }
  }
}
