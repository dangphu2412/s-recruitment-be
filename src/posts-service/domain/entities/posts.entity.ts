import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../../account-service/domain/entities/user.entity';

@Entity({
  name: 'posts',
})
export class Post {
  @PrimaryGeneratedColumn('increment')
  id: string;

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

  @RelationId((post: Post) => post.author)
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
}
