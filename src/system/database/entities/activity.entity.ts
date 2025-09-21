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
import { DayOfWeek } from './day-of-week';

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

  // Occurrence
  @Column({
    name: 'time_of_day_id',
    type: 'varchar',
  })
  timeOfDayId: string;

  // Occurrence
  @Column({
    name: 'day_of_week_id',
    type: 'varchar',
  })
  dayOfWeekId: string;

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

  @ManyToOne(() => TimeOfDay, (timeOfDay) => timeOfDay.activities)
  @JoinColumn({
    name: 'time_of_day_id',
    referencedColumnName: 'id',
  })
  timeOfDay: TimeOfDay;

  @ManyToOne(() => DayOfWeek, (timeOfDay) => timeOfDay.activities)
  @JoinColumn({
    name: 'day_of_week_id',
    referencedColumnName: 'id',
  })
  dayOfWeek: DayOfWeek;

  // @OneToMany(() => ActivityLog, (log) => log.activity)
  // @JoinColumn({
  //   name: 'id',
  //   referencedColumnName: 'activity_id',
  // })
  // logs: ActivityLog[];
}
