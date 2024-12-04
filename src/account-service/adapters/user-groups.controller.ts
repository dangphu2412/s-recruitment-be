import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  UserGroupsService,
  UserGroupsServiceToken,
} from '../domain/core/services/user-groups.service';
import {
  CreateUserGroupRequest,
  GetUserGroupRequest,
} from '../domain/presentation/dto/user-group.request';
import { CanAccessBy } from './decorators/can-access-by.decorator';
import { Permissions } from '../domain/constants/role-def.enum';

@Controller('user-groups')
export class UserGroupsController {
  constructor(
    @Inject(UserGroupsServiceToken)
    private readonly userGroupsService: UserGroupsService,
  ) {}

  @CanAccessBy(Permissions.WRITE_USER_GROUPS)
  @Post()
  createUserGroup(@Body() body: CreateUserGroupRequest) {
    return this.userGroupsService.createUserGroup(body);
  }

  @CanAccessBy(Permissions.READ_USER_GROUPS)
  @Get()
  findUserGroups(@Query() query: GetUserGroupRequest) {
    return this.userGroupsService.findUserGroups(query);
  }

  @CanAccessBy(Permissions.WRITE_USER_GROUPS)
  @Delete('/:id')
  deleteUserGroup(@Param('id', ParseIntPipe) id: number) {
    return this.userGroupsService.deleteUserGroup(id);
  }
}
