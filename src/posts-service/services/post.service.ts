import { Post } from '../domain/data-access/entities/posts.entity';
import { PostService } from '../domain/core/services/post.service';
import { PostRepository } from '../repositories/post.repository';
import slugify from 'slugify';
import { Injectable } from '@nestjs/common';
import { OffsetPagination, Page } from '../../system/query-shape/dto';
import { EditPostDTO } from '../domain/core/dto/edit-post.dto';
import { CategoryRepository } from '../repositories/category.repository';
import { In } from 'typeorm';
import { CreatePostDTO } from '../domain/core/dto/create-post.dto';

@Injectable()
export class PostServiceImpl implements PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async updateOne(dto: EditPostDTO): Promise<Post> {
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

  async createOne(dto: CreatePostDTO): Promise<void> {
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

  findById(id: number): Promise<Post> {
    return this.postRepository.findOne({
      where: { id },
      relations: ['categories', 'author'],
    });
  }

  async findPaginatedPosts(query: OffsetPagination) {
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
