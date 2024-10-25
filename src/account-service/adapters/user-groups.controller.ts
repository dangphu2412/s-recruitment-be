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
} from '../domain/interfaces/user-groups.service';
import {
  CreateUserGroupInputDto,
  GetUserGroupInputDto,
} from '../domain/inputs/user-group.input';

@Controller('user-groups')
export class UserGroupsController {
  constructor(
    @Inject(UserGroupsServiceToken)
    private readonly userGroupsService: UserGroupsService,
  ) {}

  @Post()
  createUserGroup(@Body() body: CreateUserGroupInputDto) {
    return this.userGroupsService.createUserGroup(body);
  }

  @Get()
  findUserGroups(@Query() query: GetUserGroupInputDto) {
    return this.userGroupsService.findUserGroups(query);
  }

  @Delete('/:id')
  deleteUserGroup(@Param('id', ParseIntPipe) id: number) {
    return this.userGroupsService.deleteUserGroup(id);
  }
}
