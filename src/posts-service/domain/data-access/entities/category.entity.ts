import { Column, Entity, ManyToMany, PrimaryColumn } from 'typeorm';
import { Post } from './posts.entity';

@Entity({
  name: 'categories',
})
export class Category {
  @PrimaryColumn({
    name: 'id',
    type: 'varchar',
  })
  id: string;

  @Column({
    name: 'name',
    type: 'varchar',
  })
  name: string;

  @Column({
    name: 'summary',
    type: 'varchar',
  })
  summary: string;

  @ManyToMany(() => Post, (post) => post.categories)
  posts?: Post[];
}
