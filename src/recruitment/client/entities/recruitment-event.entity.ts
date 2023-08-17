import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../../user';

@Entity({
  name: 'recruitment_events',
})
export class RecruitmentEvent {
  @PrimaryGeneratedColumn('increment')
  id: string;

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

  @ManyToMany(() => User)
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

  @ManyToOne(() => User)
  @JoinColumn({
    name: 'author_id',
    referencedColumnName: 'id',
  })
  createdBy: User;
}
