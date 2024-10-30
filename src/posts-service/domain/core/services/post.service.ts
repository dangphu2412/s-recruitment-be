import { createInterfaceToken } from '../../../../system/utils';
import { Post } from '../../data-access/entities/posts.entity';
import { Page } from '../../../../system/query-shape/types';
import { OffsetPagination } from '../../../../system/query-shape/dto';
import { EditPostDTO } from '../dto/edit-post.dto';
import { CreatePostDTO } from '../dto/create-post.dto';

export const PostServiceToken = createInterfaceToken('PostServiceToken');

export interface PostService {
  createOne(dto: CreatePostDTO): Promise<void>;
  updateOne(dto: EditPostDTO): Promise<Post>;
  findById(id: number): Promise<Post>;
  findPaginatedPosts(query: OffsetPagination): Promise<Page<Post>>;
}
