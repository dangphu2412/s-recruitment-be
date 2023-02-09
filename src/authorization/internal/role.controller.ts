import { Body, Controller, Get, Inject, Param, Put } from '@nestjs/common';
import { ApiNoContentResponse, ApiTags } from '@nestjs/swagger';
import {
  AccessRights,
  CanAccessBy,
  RoleService,
  RoleServiceToken,
} from '@authorization/client';
import { UpdateRoleDto } from '@authorization/client/dto';

@ApiTags('roles')
@Controller({
  version: '1',
  path: '/roles',
})
export class RoleController {
  constructor(
    @Inject(RoleServiceToken)
    private readonly roleService: RoleService,
  ) {}

  @CanAccessBy(AccessRights.VIEW_ACCESS_RIGHTS)
  @Get()
  getRoles() {
    return this.roleService.findAccessControlList();
  }

  // @CanAccessBy(AccessRights.EDIT_ACCESS_RIGHTS)
  @Put('/:id')
  @ApiNoContentResponse()
  async updateRole(
    @Param('id') roleId: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    await this.roleService.updateRole(roleId, updateRoleDto);
  }
}
