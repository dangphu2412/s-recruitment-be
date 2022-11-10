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
import { CanAccessBy, RoleDef } from '../../authorization';
import {
  CreateUserDto,
  ExtractNewUserQueryDto,
  TurnToMembersDto,
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

  @CanAccessBy(RoleDef.ADMIN)
  @Get('/')
  @ApiOkResponse()
  async find(@Query() query: UserManagementQuery): Promise<UserManagementView> {
    const users = await this.userService.find(query);

    return createPage({
      items: users,
      totalRecords: 100,
      query,
    });
  }

  @CanAccessBy(RoleDef.ADMIN)
  @Patch('/:id/active')
  @ApiNoContentResponse()
  async toggleIsActive(@Param('id') id: string) {
    await this.userService.toggleUserIsActive(id);
  }

  @CanAccessBy(RoleDef.ADMIN)
  @Post('/')
  @ApiCreatedResponse()
  async createUsers(@Body() createUserDto: CreateUserDto[]) {
    await this.userService.create(createUserDto);
  }

  @CanAccessBy(RoleDef.ADMIN)
  @Get('/extract-new-values')
  @ApiCreatedResponse()
  extractNewUserEmails(
    @Query() extractNewUserQueryDto: ExtractNewUserQueryDto,
  ) {
    return this.userService.extractNewUserEmails(extractNewUserQueryDto.value);
  }

  @CanAccessBy(RoleDef.ADMIN)
  @Post('/members')
  @ApiCreatedResponse()
  turnUsersIntoMembers(@Body() turnToMembersDto: TurnToMembersDto) {
    return this.userService.turnToMembers(turnToMembersDto);
  }
}
