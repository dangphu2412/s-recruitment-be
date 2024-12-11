import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../../account-service/domain/data-access/entities/user.entity';
import { RequestActivityStatus } from '../core/constants/request-activity-status.enum';
import { TimeOfDay } from './time-of-day.entity';
import { DayOfWeek } from './day-of-week';

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
    name: 'revise_note',
    type: 'varchar',
  })
  reviseNote: string;

  // Occurrence
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
