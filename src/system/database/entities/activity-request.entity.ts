import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { TimeOfDay } from './time-of-day.entity';
import { DayOfWeek } from './day-of-week.entity';
import { Activity } from './activity.entity';

export enum RequestActivityStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  REVISE = 'REVISE',
}

export enum RequestTypes {
  WORKING = 'Working',
  LATE = 'Late',
  ABSENCE = 'Absence',
  TRAINING = 'Training',
}

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

  @Column({
    name: 'assignee_id',
    type: 'varchar',
  })
  assigneeId: string;

  @Column({
    name: 'approver_id',
    type: 'varchar',
  })
  approverId: string;

  @Column({
    name: 'activity_reference_id',
    type: 'int',
    nullable: true,
  })
  activityReferenceId: string | null;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;

  @ManyToOne(() => Activity, (activity) => activity.activityRequests, {
    nullable: true,
  })
  @JoinColumn({
    name: 'activity_reference_id',
    referencedColumnName: 'id',
  })
  activityReference: Activity | null;

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
