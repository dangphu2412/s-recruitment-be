import { createInterfaceToken } from '../../../system/utils';
import { CreatePostDto } from '../dtos/create-post.dto';
import { Post } from '../entities/posts.entity';
import { Page } from '../../../system/query-shape/types';
import { OffsetPagination } from '../../../system/query-shape/dto';

export const PostServiceToken = createInterfaceToken('PostServiceToken');

export interface PostService {
  createOne(dto: CreatePostDto, authorId: string): Promise<void>;
  getById(id: number): Promise<Post>;
  search(query: OffsetPagination): Promise<Page<Post>>;
}
