import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from './role.entity';
import { MenuSetting } from '../../../../system/menu/client/entities/menu-settings.entity';

@Entity({
  name: 'permissions',
})
export class Permission {
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
    name: 'description',
    type: 'varchar',
    nullable: true,
  })
  description: string;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles?: Role[];

  @OneToMany(() => MenuSetting, (settings) => settings.permission)
  menuSettings: MenuSetting[];
}
