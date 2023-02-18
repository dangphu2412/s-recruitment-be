import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../../user';
import { Permission } from '@authorization/client/entities/permission.entity';

@Entity({
  name: 'roles',
})
export class Role {
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

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;

  @Column({
    name: 'is_editable',
    type: 'boolean',
    default: true,
  })
  isEditable: boolean;

  @ManyToOne(() => User)
  @JoinColumn({
    name: 'update_by_user_id',
    referencedColumnName: 'id',
  })
  updatedBy: User;

  @ManyToMany(() => User)
  @JoinTable({
    name: 'users_roles',
    joinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
  })
  users?: User[];

  @ManyToMany(() => Permission, (permission) => permission.roles)
  @JoinTable({
    name: 'roles_permissions',
    joinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'permission_id',
      referencedColumnName: 'id',
    },
  })
  permissions?: Permission[];
}
