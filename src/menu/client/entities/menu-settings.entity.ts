import { Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Menu } from './menu.entity';
import { Permission } from 'src/authorization/client/entities/permission.entity';

@Entity({
  name: 'menu_settings',
})
export class MenuSetting {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @OneToOne(() => Menu)
  @JoinColumn({
    name: 'menu_id',
    referencedColumnName: 'id',
  })
  menu: Menu;

  @OneToOne(() => Permission)
  @JoinColumn({
    name: 'permission_id',
    referencedColumnName: 'id',
  })
  permission: Permission;
}
