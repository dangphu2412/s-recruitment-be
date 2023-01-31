import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from './role.entity';

@Entity({
  name: 'permissions',
})
export class Permission {
  @PrimaryGeneratedColumn('increment')
  id: string;

  @Column({
    name: 'subject',
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
}
