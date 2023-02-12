import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Menu } from './menu.entity';
import { Permission } from '@authorization/client/entities/permission.entity';

@Entity({
  name: 'menu_settings',
})
export class MenuSetting {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => Menu)
  @JoinColumn({
    name: 'menu_id',
    referencedColumnName: 'id',
  })
  menu: Menu;

  @ManyToOne(() => Permission)
  @JoinColumn({
    name: 'permission_id',
    referencedColumnName: 'id',
  })
  permission: Permission;
}
