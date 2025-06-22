import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from '../../../account-service/shared/entities/user.entity';
import { LogWorkStatus } from '../core/constants/log-work-status.enum';
import { DeviceUser } from './user-log.entity';

@Entity({
  name: 'activity_logs',
})
export class ActivityLog {
  @PrimaryColumn({
    name: 'from_time',
    nullable: false,
    type: 'timestamp',
  })
  fromTime: string;

  @PrimaryColumn({
    name: 'to_time',
    nullable: false,
    type: 'timestamp',
  })
  toTime: string;

  @Column({
    name: 'work_status',
    nullable: false,
    type: 'boolean',
  })
  workStatus: LogWorkStatus;

  @Column({
    name: 'audited_from_time',
    nullable: true,
    type: 'timestamp',
  })
  auditedFromTime: string | null;

  @Column({
    name: 'audited_to_time',
    nullable: true,
    type: 'timestamp',
  })
  auditedToTime: string | null;

  @Column({
    name: 'activity_id',
    type: 'int',
  })
  activityId: number;

  @PrimaryColumn({
    name: 'track_id',
    nullable: false,
    type: 'varchar',
  })
  deviceUserId: string;

  @ManyToOne(() => User, (user) => user.activityLogs)
  @JoinColumn({
    name: 'track_id',
    referencedColumnName: 'trackingId',
  })
  author: User;

  @ManyToOne(() => DeviceUser, (user) => user.activityLogs)
  @JoinColumn({
    name: 'track_id',
    referencedColumnName: 'trackingId',
  })
  deviceAuthor: DeviceUser;

  // @ManyToOne(() => Activity, (user) => user.logs)
  // activity: Activity;
}
