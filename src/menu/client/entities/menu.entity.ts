import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  PrimaryColumn,
  Tree,
  TreeChildren,
  TreeParent,
} from 'typeorm';
import { Permission } from '../../../account-service/shared/entities/permission.entity';

@Entity({
  name: 'menus',
})
@Tree('materialized-path')
export class Menu {
  @PrimaryColumn('varchar')
  id: string;

  @Column({
    name: 'name',
    nullable: false,
    type: 'varchar',
  })
  name: string;

  @Column({
    name: 'icon_code',
    nullable: true,
    type: 'varchar',
  })
  iconCode?: string;

  @Column({
    name: 'access_link',
    nullable: true,
    type: 'varchar',
  })
  accessLink?: string;

  @TreeChildren()
  subMenus: Menu[];

  @TreeParent()
  @JoinColumn({
    name: 'parent_id',
  })
  parent: Menu;

  @ManyToMany(() => Permission, (permission) => permission.menuSettings)
  permissionSettings?: Permission[];
}
