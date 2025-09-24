import { Activity } from '../../system/database/entities/activity.entity';
import { addMinutes, compareAsc, format, parseISO, subMinutes } from 'date-fns';
import { LogWorkStatus } from './log-work-status.enum';
import { RequestTypes } from '../shared/request-activity-status.enum';
import { Injectable } from '@nestjs/common';

type WorkEvaluateDTO = {
  activities: Activity[];
  fromDateTime: string;
  toDateTime: string;
};

type WorkEvaluateResult = {
  status: LogWorkStatus;
  activityId: Activity['id'] | null;
  auditedFromDateTime: Date | null;
  auditedToDateTime: Date | null;
};

export class WorkTimeUtils {
  static formatTimeToDateByDateTime(time: string, logDate: string) {
    const [hours, minutes] = time.split(':').map(Number);

    const date = parseISO(logDate);

    date.setUTCHours(hours);
    date.setUTCMinutes(minutes);
    date.setUTCSeconds(0);

    return date;
  }

  static formatDate(date: string): string {
    return format(new Date(date), 'yyyy-MM-dd');
  }

  /**
   * compareAsc: left > right = 1
   */
  static areIntervalsBounded(small: [Date, Date], big: [Date, Date]): boolean {
    return (
      compareAsc(small[0], big[0]) >= 0 && compareAsc(small[1], big[1]) <= 0
    );
  }

  static getAuditTimeLogBefore18062025(timeLog: Date): Date | null {
    // 18-6-2025 S-Group audit the log to correct time
    if (compareAsc(timeLog, new Date('06-18-2025')) > 0) {
      return null;
    }

    /**
     * Previously, config time was early 15 mins.
     * Ex: Log: 8:30 but fingerprint store 8:15 which causes incorrect matching
     */
    return addMinutes(timeLog, 15);
  }
}

interface WorkStatusHandler {
  handle(
    activity: Activity,
    fromDateTime: string,
    toDateTime: string,
  ): LogWorkStatus | null;
}

class AbsenceHandler implements WorkStatusHandler {
  handle(
    activity: Activity,
    fromDateTime: string,
    toDateTime: string,
  ): LogWorkStatus | null {
    if (
      WorkTimeUtils.formatDate(activity.compensatoryDay) !==
      WorkTimeUtils.formatDate(fromDateTime)
    ) {
      return null;
    }

    const logStart = parseISO(fromDateTime);
    const logEnd = parseISO(toDateTime);
    const registeredFromTimeDate = WorkTimeUtils.formatTimeToDateByDateTime(
      activity.timeOfDay.fromTime,
      fromDateTime || toDateTime,
    );
    const registeredToTimeDate = WorkTimeUtils.formatTimeToDateByDateTime(
      activity.timeOfDay.toTime,
      fromDateTime || toDateTime,
    );

    if (
      WorkTimeUtils.areIntervalsBounded(
        [registeredFromTimeDate, registeredToTimeDate],
        [logStart, logEnd],
      )
    ) {
      return LogWorkStatus.ON_TIME;
    }

    return LogWorkStatus.LATE;
  }
}

class LateHandler implements WorkStatusHandler {
  handle(
    activity: Activity,
    fromDateTime: string,
    toDateTime: string,
  ): LogWorkStatus | null {
    if (
      WorkTimeUtils.formatDate(activity.requestChangeDay) !==
      WorkTimeUtils.formatDate(fromDateTime)
    ) {
      return null;
    }

    const logStart = subMinutes(parseISO(fromDateTime), 15);
    const logEnd = parseISO(toDateTime);
    const registeredFromTimeDate = WorkTimeUtils.formatTimeToDateByDateTime(
      activity.timeOfDay.fromTime,
      fromDateTime || toDateTime,
    );
    const registeredToTimeDate = WorkTimeUtils.formatTimeToDateByDateTime(
      activity.timeOfDay.toTime,
      fromDateTime || toDateTime,
    );

    if (
      WorkTimeUtils.areIntervalsBounded(
        [registeredFromTimeDate, registeredToTimeDate],
        [logStart, logEnd],
      )
    ) {
      return LogWorkStatus.ON_TIME;
    }

    return LogWorkStatus.LATE;
  }
}

class WorkingHandler implements WorkStatusHandler {
  handle(
    activity: Activity,
    fromDateTime: string,
    toDateTime: string,
  ): LogWorkStatus | null {
    if (
      parseInt(activity.dayOfWeek.id) !== new Date(fromDateTime).getUTCDay()
    ) {
      return null;
    }

    const logStart = parseISO(fromDateTime);
    const logEnd = parseISO(toDateTime);
    const auditLogStart =
      WorkTimeUtils.getAuditTimeLogBefore18062025(logStart) ?? logStart;
    const auditLogEnd =
      WorkTimeUtils.getAuditTimeLogBefore18062025(logEnd) ?? logEnd;

    const registeredFromTimeDate = WorkTimeUtils.formatTimeToDateByDateTime(
      activity.timeOfDay.fromTime,
      fromDateTime || toDateTime,
    );
    const registeredToTimeDate = WorkTimeUtils.formatTimeToDateByDateTime(
      activity.timeOfDay.toTime,
      fromDateTime || toDateTime,
    );

    if (
      WorkTimeUtils.areIntervalsBounded(
        [registeredFromTimeDate, registeredToTimeDate],
        [auditLogStart, auditLogEnd],
      )
    ) {
      return LogWorkStatus.ON_TIME;
    }

    return LogWorkStatus.LATE;
  }
}

@Injectable()
export class ActivityMatcher {
  private readonly workStatusHandlers: Record<string, WorkStatusHandler> = {
    [RequestTypes.ABSENCE]: new AbsenceHandler(),
    [RequestTypes.LATE]: new LateHandler(),
    [RequestTypes.WORKING]: new WorkingHandler(),
  };

  match({
    activities,
    toDateTime,
    fromDateTime,
  }: WorkEvaluateDTO): WorkEvaluateResult {
    if (activities.length === 0) {
      return {
        status: LogWorkStatus.NOT_FINISHED,
        activityId: null,
        auditedFromDateTime: null,
        auditedToDateTime: null,
      };
    }

    for (const activity of activities) {
      const workStatusHandler = this.workStatusHandlers[activity.requestType];

      if (workStatusHandler) {
        const status = workStatusHandler.handle(
          activity,
          fromDateTime,
          toDateTime,
        );
        if (status !== null) {
          return {
            status,
            activityId: activity.id,
            auditedFromDateTime: WorkTimeUtils.getAuditTimeLogBefore18062025(
              parseISO(fromDateTime),
            ),
            auditedToDateTime: WorkTimeUtils.getAuditTimeLogBefore18062025(
              parseISO(toDateTime),
            ),
          };
        }
      }
    }

    return {
      status: LogWorkStatus.NOT_FINISHED,
      activityId: null,
      auditedFromDateTime: null,
      auditedToDateTime: null,
    };
  }
}
