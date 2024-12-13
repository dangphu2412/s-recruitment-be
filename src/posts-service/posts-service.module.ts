import { Module } from '@nestjs/common';
import { PostServiceToken } from './domain/core/services/post.service';
import { PostServiceImpl } from './services/post.service';
import { PostRepository } from './repositories/post.repository';
import { PostController } from './controllers/post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './domain/data-access/entities/posts.entity';
import { CategoryRepository } from './repositories/category.repository';
import { Category } from './domain/data-access/entities/category.entity';
import { CategoryServiceToken } from './domain/core/services/category.service';
import { CategoryServiceImpl } from './services/category.service';
import { CategoryController } from './controllers/category.controller';

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
