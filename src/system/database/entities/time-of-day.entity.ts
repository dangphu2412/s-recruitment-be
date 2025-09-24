import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { ActivityRequest } from './activity-request.entity';
import { Activity } from './activity.entity';

@Entity({
  name: 'mdm_time_of_days',
})
export class TimeOfDay {
  @PrimaryColumn({
    name: 'id',
    type: 'varchar',
  })
  id: string;

  @Column({
    name: 'name',
    nullable: false,
    type: 'varchar',
  })
  name: string;

  @Column({
    name: 'from_time',
    nullable: false,
    type: 'varchar',
  })
  fromTime: string;

  @Column({
    name: 'to_time',
    nullable: false,
    type: 'varchar',
  })
  toTime: string;

  @OneToMany(
    () => ActivityRequest,
    (activityRequest) => activityRequest.timeOfDay,
  )
  activityRequests: ActivityRequest[];

  @OneToMany(() => Activity, (activity) => activity.timeOfDay)
  activities: Activity[];
}
