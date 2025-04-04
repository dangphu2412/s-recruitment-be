import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({
  name: 'device_user_logs',
})
export class DeviceUser {
  @PrimaryColumn({
    name: 'device_user_id',
    nullable: false,
    type: 'varchar',
  })
  deviceUserId: string;

  @Column({
    name: 'name',
    type: 'varchar',
  })
  name: string;
}
