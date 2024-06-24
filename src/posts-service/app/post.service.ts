import { Post } from '../domain/entities/posts.entity';
import { PostService } from '../domain/services/post.service';
import { PostRepository } from './post.repository';
import slugify from 'slugify';
import { Injectable } from '@nestjs/common';
import { OffsetPagination, Page } from '../../system/query-shape/dto';
import { EditPostDto } from '../domain/dtos/edit-post.dto';
import { CategoryRepository } from './category.repository';
import { In } from 'typeorm';
import { CreatePostDto } from '../domain/dtos/create-post.dto';

@Injectable()
export class PostServiceImpl implements PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async updateOne(dto: EditPostDto): Promise<Post> {
    const entity = new Post();

    entity.id = dto.id;
    entity.title = dto.title;
    entity.content = dto.content;
    entity.previewImage = dto.previewImage;
    entity.slug = slugify(dto.title, { lower: true });
    entity.authorId = dto.authorId;
    entity.summary = dto.summary;

    const { categoryCodes } = dto;

    entity.categories = await this.categoryRepository.findBy({
      id: In(categoryCodes),
    });
    return this.postRepository.save(entity);
  }

  async createOne(dto: CreatePostDto): Promise<void> {
    const entity = new Post();

    entity.title = dto.title;
    entity.content = dto.content;
    entity.previewImage = dto.previewImage;
    entity.slug = slugify(dto.title, { lower: true });
    entity.authorId = dto.authorId;
    entity.summary = dto.summary;

    const { categoryCodes } = dto;

    entity.categories = await this.categoryRepository.findBy({
      id: In(categoryCodes),
    });

    await this.postRepository.save(entity);
  }

  getById(id: number): Promise<Post> {
    return this.postRepository.findOne({
      where: { id },
      relations: ['categories', 'author'],
    });
  }

  async search(query: OffsetPagination) {
    const [items, total] = await this.postRepository.findAndCount({
      relations: ['categories', 'author'],
    });

    return Page.of({
      items,
      totalRecords: total,
      query,
    });
  }
}
