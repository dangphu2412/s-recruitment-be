import { createInterfaceToken } from '../../../system/utils';
import { CreatePostRequestDto } from '../dtos/create-post-request.dto';
import { Post } from '../entities/posts.entity';
import { Page } from '../../../system/query-shape/types';
import { OffsetPagination } from '../../../system/query-shape/dto';
import { EditPostDto } from '../dtos/edit-post.dto';

export const PostServiceToken = createInterfaceToken('PostServiceToken');

export interface PostService {
  createOne(dto: CreatePostRequestDto, authorId: string): Promise<void>;
  updateOne(dto: EditPostDto): Promise<Post>;
  getById(id: number): Promise<Post>;
  search(query: OffsetPagination): Promise<Page<Post>>;
}
