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

  @ManyToOne(() => RecruitmentEvent)
  @JoinColumn({
    name: 'event_id',
    referencedColumnName: 'id',
  })
  organizedBy: RecruitmentEvent;

  @OneToMany(() => EmployeeEventPoint, (point) => point.employee)
  points: EmployeeEventPoint[];
}
