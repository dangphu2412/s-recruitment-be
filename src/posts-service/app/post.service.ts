import { CreatePostRequestDto } from '../domain/dtos/create-post-request.dto';
import { Post } from '../domain/entities/posts.entity';
import { PostService } from '../domain/services/post.service';
import { PostRepository } from './post.repository';
import slugify from 'slugify';
import { Injectable } from '@nestjs/common';
import { OffsetPagination, Page } from '../../system/query-shape/dto';
import { EditPostDto } from '../domain/dtos/edit-post.dto';

@Injectable()
export class PostServiceImpl implements PostService {
  constructor(private readonly postRepository: PostRepository) {}

  async updateOne(dto: EditPostDto): Promise<Post> {
    const entity = new Post();

    entity.id = dto.id;
    entity.title = dto.title;
    entity.content = dto.content;
    entity.slug = slugify(dto.title, { lower: true });
    entity.authorId = dto.authorId;

    return this.postRepository.save(entity);
  }

  async createOne(dto: CreatePostRequestDto, authorId: string): Promise<void> {
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

  async search(query: OffsetPagination) {
    const [items, total] = await this.postRepository.findAndCount();

    return Page.of({
      items,
      totalRecords: total,
      query,
    });
  }
}
