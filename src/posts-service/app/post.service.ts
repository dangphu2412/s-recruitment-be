import { CreatePostDto } from '../domain/dtos/create-post.dto';
import { Post } from '../domain/entities/posts.entity';
import { PostService } from '../domain/services/post.service';
import { PostRepository } from './post.repository';
import slugify from 'slugify';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PostServiceImpl implements PostService {
  constructor(private readonly postRepository: PostRepository) {}

  async createOne(dto: CreatePostDto, authorId: string): Promise<void> {
    const entity = new Post();

    entity.title = dto.title;
    entity.content = dto.content;
    entity.slug = slugify(dto.title, { lower: true });
    entity.authorId = authorId;

    await this.postRepository.insert(entity);
  }

  getById(id: number): Promise<Post> {
    return this.postRepository.findOneBy({ id });
  }

  getAll() {
    return this.postRepository.find();
  }
}
