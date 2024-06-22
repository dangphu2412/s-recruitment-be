import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PostService, PostServiceToken } from '../domain/services/post.service';
import { CreatePostDto } from '../domain/dtos/create-post.dto';
import { CanAccessBy } from '../../account-service/adapters/decorators/can-access-by.decorator';
import { AccessRights } from '../../account-service/domain/constants/role-def.enum';
import { CurrentUser } from '../../account-service/adapters/decorators';
import { JwtPayload } from '../../account-service/domain/dtos/jwt-payload';
import { OffsetPagination } from '../../system/query-shape/dto';

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

  @CanAccessBy(AccessRights.EDIT_MEMBER_USER)
  @Post()
  login(@Body() dto: CreatePostDto, @CurrentUser() user: JwtPayload) {
    return this.postService.createOne(dto, user.sub);
  }

  @Get('/:id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.postService.getById(id);
  }

  @Get('/')
  getAll(@Query() query: OffsetPagination) {
    return this.postService.search(query);
  }
}
