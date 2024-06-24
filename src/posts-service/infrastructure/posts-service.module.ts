import { Module } from '@nestjs/common';
import { PostServiceToken } from '../domain/services/post.service';
import { PostServiceImpl } from '../app/post.service';
import { PostRepository } from '../app/post.repository';
import { PostController } from '../adapters/post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from '../domain/entities/posts.entity';
import { CategoryRepository } from '../app/category.repository';
import { Category } from '../domain/entities/category.entity';
import { CategoryServiceToken } from '../domain/services/category.service';
import { CategoryServiceImpl } from '../app/category.service';
import { CategoryController } from '../adapters/category.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Post, Category])],
  controllers: [PostController, CategoryController],
  providers: [
    PostRepository,
    CategoryRepository,
    {
      provide: PostServiceToken,
      useClass: PostServiceImpl,
    },
    {
      provide: CategoryServiceToken,
      useClass: CategoryServiceImpl,
    },
  ],
})
export class PostsServiceModule {}
