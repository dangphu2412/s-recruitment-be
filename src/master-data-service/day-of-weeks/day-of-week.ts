import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { ActivityRequest } from '../../activities/shared/entities/activity-request.entity';
import { Activity } from '../../activities/shared/entities/activity.entity';

@Entity({
  name: 'mdm_day_of_weeks',
})
export class DayOfWeek {
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

  @OneToMany(
    () => ActivityRequest,
    (activityRequest) => activityRequest.timeOfDay,
  )
  activityRequests: ActivityRequest[];

  @OneToMany(() => Activity, (activity) => activity.dayOfWeek)
  activities: Activity[];
}
