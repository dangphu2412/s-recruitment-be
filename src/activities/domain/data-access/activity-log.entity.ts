import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from '../../../account-service/domain/data-access/entities/user.entity';
import { LogWorkStatus } from '../core/constants/log-work-status.enum';

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
}
