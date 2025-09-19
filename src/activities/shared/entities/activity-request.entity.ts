import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../../account-service/shared/entities/user.entity';
import { RequestActivityStatus } from '../request-activity-status.enum';
import { TimeOfDay } from '../../../master-data-service/time-of-days/time-of-day.entity';
import { DayOfWeek } from '../../../master-data-service/day-of-weeks/day-of-week';

@Entity({
  name: 'activity_requests',
})
export class ActivityRequest {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({
    name: 'request_type',
    type: 'varchar',
  })
  requestType: string;

  @Column({
    name: 'reject_reason',
    type: 'varchar',
  })
  rejectReason: string;

  @Column({
    name: 'reason',
    type: 'varchar',
  })
  reason: string;

  @Column({
    name: 'compensatory_day',
    type: 'timestamp',
  })
  compensatoryDay: string;

  @Column({
    name: 'request_change_day',
    type: 'timestamp',
  })
  requestChangeDay: string;

  @Column({
    name: 'revise_note',
    type: 'varchar',
  })
  reviseNote: string;

  // Recurring request
  @Column({
    name: 'time_of_day_id',
    type: 'varchar',
  })
  timeOfDayId: string;

  @Column({
    name: 'day_of_week_id',
    type: 'varchar',
  })
  dayOfWeekId: string;

  @Column({
    name: 'approval_status',
    type: 'varchar',
  })
  approvalStatus: RequestActivityStatus;

  @Column({
    name: 'author_id',
    type: 'varchar',
  })
  authorId: string;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.activityRequests)
  @JoinColumn({
    name: 'author_id',
    referencedColumnName: 'id',
  })
  author: User;

  @ManyToOne(() => User, (user) => user.activityRequests)
  @JoinColumn({
    name: 'assignee_id',
    referencedColumnName: 'id',
  })
  assignee: User;

  @ManyToOne(() => User, (user) => user.activityRequests)
  @JoinColumn({
    name: 'approver_id',
    referencedColumnName: 'id',
  })
  approver: User;

  @ManyToOne(() => TimeOfDay, (timeOfDay) => timeOfDay.activityRequests)
  @JoinColumn({
    name: 'time_of_day_id',
    referencedColumnName: 'id',
  })
  timeOfDay: TimeOfDay;

  @ManyToOne(() => DayOfWeek, (timeOfDay) => timeOfDay.activityRequests)
  @JoinColumn({
    name: 'day_of_week_id',
    referencedColumnName: 'id',
  })
  dayOfWeek: DayOfWeek;
}
