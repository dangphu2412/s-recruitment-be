import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../../../account-service/domain/data-access/entities/user.entity';
import { Category } from './category.entity';

@Entity({
  name: 'posts',
})
export class Post {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({
    name: 'slug',
    nullable: false,
  })
  slug: string;

  @Column({
    name: 'title',
    nullable: false,
  })
  title: string;

  @Column({
    name: 'content',
    nullable: false,
    type: 'text',
  })
  content: string;

  @Column({
    name: 'preview_image',
    nullable: false,
    type: 'varchar',
  })
  previewImage: string;

  @Column({
    name: 'summary',
    nullable: false,
    type: 'varchar',
  })
  summary: string;

  @RelationId((post: Post) => post.author)
  @Column({
    name: 'author_id',
  })
  authorId: string;

  @ManyToOne(() => User, (user) => user.posts)
  @JoinColumn({
    name: 'author_id',
    referencedColumnName: 'id',
  })
  author: User;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;

  @DeleteDateColumn({
    name: 'deleted_at',
  })
  deletedAt: Date;

  @ManyToMany(() => Category, (category) => category.posts)
  @JoinTable({
    name: 'posts_categories',
    joinColumn: {
      name: 'post_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'category_id',
      referencedColumnName: 'id',
    },
  })
  categories?: Category[];
}
