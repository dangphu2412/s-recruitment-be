import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { ActivityLog } from './activity-log.entity';

@Entity({
  name: 'device_user_logs',
})
export class DeviceUser {
  @PrimaryColumn({
    name: 'device_user_id',
    nullable: false,
    type: 'varchar',
  })
  trackingId: string;

  @Column({
    name: 'name',
    type: 'varchar',
  })
  name: string;

  @OneToMany(() => ActivityLog, (activityLog) => activityLog.deviceAuthor)
  activityLogs: ActivityLog[];
}
