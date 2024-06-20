import { Module } from '@nestjs/common';
import { PostServiceToken } from '../domain/services/post.service';
import { PostServiceImpl } from '../app/post.service';
import { PostRepository } from '../app/post.repository';
import { PostController } from '../adapters/post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from '../domain/entities/posts.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Post])],
  controllers: [PostController],
  providers: [
    PostRepository,
    {
      provide: PostServiceToken,
      useClass: PostServiceImpl,
    },
  ],
})
export class PostsServiceModule {}
