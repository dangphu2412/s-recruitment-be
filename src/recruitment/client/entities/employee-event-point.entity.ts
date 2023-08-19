import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RecruitmentEvent } from './recruitment-event.entity';
import { User } from '../../../user';
import { RecruitmentEmployee } from './recruitment-employee.entity';

@Entity({
  name: 'employee_event_points',
})
export class EmployeeEventPoint {
  @PrimaryGeneratedColumn('increment')
  id: string;

  @Column({
    name: 'point',
    type: 'int',
    nullable: false,
  })
  point: number;

  @Column({
    name: 'author_id',
  })
  authorId: string;

  @Column({
    name: 'event_id',
  })
  eventId: number;

  @Column({
    name: 'employee_id',
  })
  employeeId: number;

  @ManyToOne(() => RecruitmentEvent)
  @JoinColumn({
    name: 'event_id',
    referencedColumnName: 'id',
  })
  event: RecruitmentEvent;

  @ManyToOne(() => User)
  @JoinColumn({
    name: 'author_id',
    referencedColumnName: 'id',
  })
  author: User;

  @ManyToOne(() => RecruitmentEmployee)
  @JoinColumn({
    name: 'employee_id',
    referencedColumnName: 'id',
  })
  employee: RecruitmentEmployee;
}
