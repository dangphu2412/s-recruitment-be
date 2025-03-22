import { Activity } from './domain/data-access/activity.entity';
import { compareAsc, format, parse, subMinutes } from 'date-fns';
import { LogWorkStatus } from './domain/core/constants/log-work-status.enum';
import { RequestTypes } from './domain/core/constants/request-activity-status.enum';
import { Injectable } from '@nestjs/common';

type WorkEvaluateDTO = {
  activities: Activity[];
  fromDateTime: string;
  toDateTime: string;
};

export class WorkTimeUtils {
  static parseTime(time: string): Date {
    return parse(time, 'HH:mm:ss', new Date());
  }

  static formatDate(date: string): string {
    return format(new Date(date), 'yyyy-MM-dd');
  }

  static getHHMMSS(time: string): Date {
    return WorkTimeUtils.parseTime(
      `${new Date(time).getUTCHours().toString().padStart(2, '0')}:` +
        `${new Date(time).getUTCMinutes().toString().padStart(2, '0')}:` +
        `${new Date(time).getUTCSeconds().toString().padStart(2, '0')}`,
    );
  }

  static areIntervalsBounded(small: [Date, Date], big: [Date, Date]): boolean {
    return (
      compareAsc(small[0], big[0]) >= 0 && compareAsc(small[1], big[1]) <= 0
    );
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

    const workStart = WorkTimeUtils.parseTime(activity.timeOfDay.fromTime);
    const workEnd = WorkTimeUtils.parseTime(activity.timeOfDay.toTime);
    const logStart = WorkTimeUtils.getHHMMSS(fromDateTime);
    const logEnd = WorkTimeUtils.getHHMMSS(toDateTime);

    if (
      WorkTimeUtils.areIntervalsBounded(
        [workStart, workEnd],
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

    const workStart = WorkTimeUtils.parseTime(activity.timeOfDay.fromTime);
    const workEnd = WorkTimeUtils.parseTime(activity.timeOfDay.toTime);
    const logStart = subMinutes(WorkTimeUtils.getHHMMSS(fromDateTime), 15);
    const logEnd = WorkTimeUtils.getHHMMSS(toDateTime);

    if (
      WorkTimeUtils.areIntervalsBounded(
        [workStart, workEnd],
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

    const workStart = WorkTimeUtils.parseTime(activity.timeOfDay.fromTime);
    const workEnd = WorkTimeUtils.parseTime(activity.timeOfDay.toTime);
    const logStart = WorkTimeUtils.getHHMMSS(fromDateTime);
    const logEnd = WorkTimeUtils.getHHMMSS(toDateTime);

    if (
      WorkTimeUtils.areIntervalsBounded(
        [workStart, workEnd],
        [logStart, logEnd],
      )
    ) {
      return LogWorkStatus.ON_TIME;
    }

    return LogWorkStatus.LATE;
  }
}

@Injectable()
export class WorkStatusEvaluator {
  private readonly handlers: Record<string, WorkStatusHandler> = {
    [RequestTypes.ABSENCE]: new AbsenceHandler(),
    [RequestTypes.LATE]: new LateHandler(),
    [RequestTypes.WORKING]: new WorkingHandler(),
  };

  evaluateStatus({
    activities,
    toDateTime,
    fromDateTime,
  }: WorkEvaluateDTO): LogWorkStatus {
    if (activities.length === 0) {
      return LogWorkStatus.NOT_FINISHED;
    }

    for (const activity of activities) {
      const handler = this.handlers[activity.requestType];

      if (handler) {
        const status = handler.handle(activity, fromDateTime, toDateTime);
        if (status !== null) {
          return status;
        }
      }
    }

    return LogWorkStatus.NOT_FINISHED;
  }
}
