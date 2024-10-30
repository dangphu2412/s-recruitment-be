import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  PrimaryGeneratedColumn,
  Tree,
  TreeChildren,
  TreeParent,
} from 'typeorm';
import { Permission } from '../../../../account-service/domain/data-access/entities/permission.entity';

@Entity({
  name: 'menus',
})
@Tree('materialized-path')
export class Menu {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({
    name: 'name',
    nullable: false,
    unique: true,
    type: 'varchar',
  })
  name: string;

  @Column({
    name: 'code',
    nullable: false,
    type: 'varchar',
  })
  code: string;

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
