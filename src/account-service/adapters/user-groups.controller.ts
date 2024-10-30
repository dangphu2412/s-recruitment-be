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

@Controller('user-groups')
export class UserGroupsController {
  constructor(
    @Inject(UserGroupsServiceToken)
    private readonly userGroupsService: UserGroupsService,
  ) {}

  @Post()
  createUserGroup(@Body() body: CreateUserGroupRequest) {
    return this.userGroupsService.createUserGroup(body);
  }

  @Get()
  findUserGroups(@Query() query: GetUserGroupRequest) {
    return this.userGroupsService.findUserGroups(query);
  }

  @Delete('/:id')
  deleteUserGroup(@Param('id', ParseIntPipe) id: number) {
    return this.userGroupsService.deleteUserGroup(id);
  }
}
