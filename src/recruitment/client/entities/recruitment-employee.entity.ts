import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RecruitmentEvent } from './recruitment-event.entity';

@Entity({
  name: 'recruitment_employees',
})
export class RecruitmentEmployee {
  @PrimaryGeneratedColumn('increment')
  id: string;

  @Column({
    name: 'data',
    type: 'json',
    nullable: false,
  })
  data: string;

  @ManyToOne(() => RecruitmentEvent)
  @JoinColumn({
    name: 'event_id',
    referencedColumnName: 'id',
  })
  organizedBy: RecruitmentEvent;
}
