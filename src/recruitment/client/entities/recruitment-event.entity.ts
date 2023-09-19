import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../../account-service/user';
import { RecruitmentEmployee } from './recruitment-employee.entity';
import { EmployeeEventPoint } from './employee-event-point.entity';

@Entity({
  name: 'recruitment_events',
})
export class RecruitmentEvent {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({
    name: 'name',
    type: 'varchar',
    nullable: false,
    unique: true,
  })
  name: string;

  @Column({
    name: 'location',
    type: 'varchar',
    nullable: false,
  })
  location: string;

  @Column({
    name: 'start_date',
    type: 'date',
    nullable: false,
  })
  startDate: Date;

  @Column({
    name: 'end_date',
    type: 'date',
    nullable: false,
  })
  endDate: Date;

  @ManyToMany(() => User, (user) => user.joinedRecruitEvents)
  @JoinTable({
    name: 'recruitment_events_examiners',
    joinColumn: {
      name: 'recruitment_event_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'examiner_id',
      referencedColumnName: 'id',
    },
  })
  examiners?: User[];

  @Column({
    name: 'author_id',
  })
  authorId: string;

  @ManyToOne(() => User)
  @JoinColumn({
    name: 'author_id',
    referencedColumnName: 'id',
  })
  createdBy: User;

  @OneToMany(
    () => RecruitmentEmployee,
    (recruitmentEmployee) => recruitmentEmployee.organizedBy,
  )
  employees: RecruitmentEmployee[];

  @Column({
    name: 'scoring_standard',
    type: 'json',
  })
  scoringStandards: any[];

  @OneToMany(() => EmployeeEventPoint, (point) => point.event)
  points: EmployeeEventPoint[];
}
