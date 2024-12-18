import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RecruitmentEvent } from './recruitment-event.entity';
import { EmployeeEventPoint } from './employee-event-point.entity';

@Entity({
  name: 'recruitment_employees',
})
export class RecruitmentEmployee {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({
    name: 'data',
    type: 'json',
    nullable: false,
  })
  data: object;

  @Column({
    name: 'event_id',
  })
  eventId: number;

  @ManyToOne(() => RecruitmentEvent)
  @JoinColumn({
    name: 'event_id',
    referencedColumnName: 'id',
  })
  organizedBy: RecruitmentEvent;

  @OneToMany(() => EmployeeEventPoint, (point) => point.employee)
  points: EmployeeEventPoint[];

  @Column({
    name: 'point',
    select: false,
    insert: false,
  })
  point: number;

  @Column({
    name: 'my_voted_point',
    select: false,
    insert: false,
  })
  myVotedPoint: number;

  @Column({
    name: 'my_note',
    select: false,
    insert: false,
  })
  myNote: number;

  @Column({
    name: 'vote_status',
    select: false,
    insert: false,
  })
  voteStatus: number;
}
