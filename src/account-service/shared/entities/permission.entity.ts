import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from './role.entity';
import { Menu } from '../../../menu';

@Entity({
  name: 'permissions',
})
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'code',
    type: 'varchar',
    nullable: false,
    unique: true,
  })
  code: string;

  @Column({
    name: 'name',
    type: 'varchar',
    nullable: false,
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

  @ManyToMany(() => Menu, (settings) => settings.permissionSettings)
  @JoinTable({
    name: 'menu_settings',
    joinColumn: {
      name: 'permission_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'menu_id',
      referencedColumnName: 'id',
    },
  })
  menuSettings: Menu[];
}
