import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser, Identified, JwtPayload } from '../../authentication';
import { CanAccessBy, APP_RBAC } from '../../authorization';
import {
  ExtractNewUserQueryDto,
  CreateUsersDto,
  UserManagementQuery,
  UserManagementView,
  UserService,
  UserServiceToken,
} from '../client';
import { createPage } from '../../shared/query-shape/pagination/factories/page.factory';

@ApiTags('users')
@Controller({
  path: 'users',
  version: '1',
})
export class UserController {
  constructor(
    @Inject(UserServiceToken)
    private readonly userService: UserService,
  ) {}

  @Identified
  @Get('/me')
  @ApiOkResponse()
  findMyProfile(@CurrentUser() user: JwtPayload) {
    return this.userService.findMyProfile(user.sub);
  }

  @CanAccessBy(APP_RBAC.ADMIN)
  @Get('/')
  @ApiOkResponse()
  async find(@Query() query: UserManagementQuery): Promise<UserManagementView> {
    const [users, totalRecords] = await Promise.all([
      this.userService.find(query),
      this.userService.count(query),
    ]);

    return createPage({
      items: users,
      totalRecords,
      query,
    });
  }

  @CanAccessBy(APP_RBAC.ADMIN)
  @Patch('/:id/active')
  @ApiNoContentResponse()
  async toggleIsActive(@Param('id') id: string) {
    await this.userService.toggleUserIsActive(id);
  }

  @CanAccessBy(APP_RBAC.ADMIN)
  @Post('/')
  @ApiCreatedResponse()
  async createUsers(@Body() createUsersDto: CreateUsersDto) {
    await this.userService.createUserUseCase(createUsersDto);
  }

  @CanAccessBy(APP_RBAC.ADMIN)
  @Get('/extract-new-values')
  @ApiCreatedResponse()
  extractNewUserEmails(
    @Query() extractNewUserQueryDto: ExtractNewUserQueryDto,
  ) {
    return this.userService.extractNewUserEmails(extractNewUserQueryDto.value);
  }
}
