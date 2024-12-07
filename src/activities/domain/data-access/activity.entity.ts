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

@Entity({
  name: 'activities',
})
export class Activity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({
    name: 'request_type',
    type: 'varchar',
  })
  requestType: string;

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
