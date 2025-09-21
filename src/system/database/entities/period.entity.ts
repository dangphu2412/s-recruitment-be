import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';

@Entity({
  name: 'mdm_periods',
})
export class Period {
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
    name: 'description',
    nullable: true,
    type: 'varchar',
  })
  description: string;

  @OneToMany(() => User, (user) => user.period)
  users: User[];
}
