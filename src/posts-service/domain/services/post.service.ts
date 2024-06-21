import { createInterfaceToken } from '../../../system/utils';
import { CreatePostDto } from '../dtos/create-post.dto';
import { Post } from '../entities/posts.entity';

export const PostServiceToken = createInterfaceToken('PostServiceToken');

export interface PostService {
  createOne(dto: CreatePostDto, authorId: string): Promise<void>;
  getById(id: number): Promise<Post>;
  getAll(): Promise<Post[]>;
}
