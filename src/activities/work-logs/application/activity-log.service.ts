import { Injectable, Logger } from '@nestjs/common';
import { ActivityLogRepository } from '../infras/activity-log.repository';
import { FindLogsRequest } from '../presentation/dtos/find-logs.request';
import { OffsetPaginationResponse } from '../../../system/pagination';
import { ActivityRepository } from '../../managements/activity.repository';
import { LogWorkStatus } from '../log-work-status.enum';
import { ActivityLog } from '../../../system/database/entities/activity-log.entity';
import {
  ActivityMatcher,
  WorkTimeUtils,
} from './work-status-evaluator.service';
import { LogFileService } from '../infras/log-file.service';
import { utils, write } from 'xlsx';
import { WorkLogExtractor } from './work-log-extractor';
import { ActivityLogService } from './interfaces/activity-log.service';

export type LogDTO = {
  userSn: number;
  deviceUserId: string;
  recordTime: string;
};

type SegmentedLogByDatePerUser = Map<string, Map<string, LogDTO[]>>;

@Injectable()
export class ActivityLogServiceImpl implements ActivityLogService {
  private readonly logger = new Logger(ActivityLogServiceImpl.name);

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

  async runUserLogComplianceCheck() {
    const logDTOS = await this.logFileService.getLogs();

    const lastHalfYearLogs =
      WorkLogExtractor.extractLogsFromLastHalfYear(logDTOS);
    const logsByDatePerUser = this.segmentLogByDatePerUser(lastHalfYearLogs);

    for (const [deviceUserId, dateMapToLogs] of logsByDatePerUser.entries()) {
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
          const { status, activityId, auditedToDateTime, auditedFromDateTime } =
            this.workStatusEvaluator.match({
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
    }

    this.logger.log(
      `Finished process: ${[...logsByDatePerUser.keys()].toString()}`,
    );
  }

  private segmentLogByDatePerUser(
    logDTOs: LogDTO[],
  ): SegmentedLogByDatePerUser {
    const segmentedLogByDatePerUser: SegmentedLogByDatePerUser = new Map();

    for (const log of logDTOs) {
      const dateId = WorkTimeUtils.formatDate(log.recordTime);

      if (!segmentedLogByDatePerUser.has(log.deviceUserId)) {
        segmentedLogByDatePerUser.set(log.deviceUserId, new Map());
      }

      const dateSegmentedLogs = segmentedLogByDatePerUser.get(log.deviceUserId);

      if (!dateSegmentedLogs.has(dateId)) {
        dateSegmentedLogs.set(dateId, []);
      }

      dateSegmentedLogs.get(dateId).push(log);
    }

    return segmentedLogByDatePerUser;
  }

  async downloadLateReportFile(): Promise<Buffer> {
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
