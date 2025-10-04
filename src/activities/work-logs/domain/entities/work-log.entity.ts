import { LogWorkStatus } from '../../../../system/database/entities/activity-log.entity';

export class WorkLog {
  fromTime: string;
  toTime: string;
  workStatus: LogWorkStatus;
  auditedFromTime: string | null;
  auditedToTime: string | null;
  activityId: number;
  deviceUserId: string;
}
