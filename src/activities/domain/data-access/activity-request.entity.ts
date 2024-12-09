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
    name: 'time_of_day',
    type: 'varchar',
  })
  timeOfDay: string;

  // Occurrence
  @Column({
    name: 'day_of_week',
    type: 'varchar',
  })
  dayOfWeek: string;

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
}
