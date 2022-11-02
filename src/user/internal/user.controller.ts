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
  UserManagementQuery,
  UserManagementView,
  UserService,
  UserServiceToken,
} from '../client';

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
  find(@Query() query: UserManagementQuery): Promise<UserManagementView> {
    return this.userService.find(query);
  }

  @CanAccessBy(RoleDef.ADMIN)
  @Patch('/:id/active')
  @ApiNoContentResponse()
  async toggleIsActive(@Param('id') id: string) {
    await this.userService.toggleUserIsActive(id);
  }

  // @CanAccessBy(RoleDef.ADMIN)
  @Post('/')
  @ApiCreatedResponse()
  async createUser(@Body() createUserDto: CreateUserDto[]) {
    const emails = createUserDto.map((dto) => dto.email);

    await this.userService.assertEmails(emails);

    return this.userService.create(createUserDto);
  }
}
