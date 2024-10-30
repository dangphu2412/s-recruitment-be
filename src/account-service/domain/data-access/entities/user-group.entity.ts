import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity({
  name: 'user_groups',
})
export class UserGroup {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({
    name: 'name',
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

  @ManyToMany(() => User, (user) => user.userGroups, { onDelete: 'CASCADE' })
  users?: User[];
}
