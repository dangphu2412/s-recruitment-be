import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  PostService,
  PostServiceToken,
} from '../domain/core/services/post.service';
import { CreatePostRequest } from '../domain/presentation/dto/create-post.request';
import { CanAccessBy } from '../../account-service/adapters/decorators/can-access-by.decorator';
import { AccessRights } from '../../account-service/domain/constants/role-def.enum';
import { CurrentUser } from '../../account-service/adapters/decorators';
import { JwtPayload } from '../../account-service/domain/dtos/jwt-payload';
import { OffsetPagination } from '../../system/query-shape/dto';
import { EditPostRequest } from '../domain/presentation/dto/edit-post.request';

@ApiTags('posts')
@Controller({
  path: 'posts',
  version: '1',
})
export class PostController {
  constructor(
    @Inject(PostServiceToken)
    private readonly postService: PostService,
  ) {}

  @CanAccessBy(AccessRights.MANAGE_POSTS)
  @Post()
  createPost(@Body() dto: CreatePostRequest, @CurrentUser() user: JwtPayload) {
    return this.postService.createOne({ ...dto, authorId: user.sub });
  }

  @CanAccessBy(AccessRights.MANAGE_POSTS)
  @Patch('/:id')
  editPost(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: EditPostRequest,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.postService.updateOne({ ...dto, authorId: user.sub, id });
  }

  @Get('/:id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.postService.findById(id);
  }

  @Get('/')
  getAll(@Query() query: OffsetPagination) {
    return this.postService.findPaginatedPosts(query);
  }
}
