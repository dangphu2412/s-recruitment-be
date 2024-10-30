import { Body, Controller, Get, Inject, Param, Put } from '@nestjs/common';
import { ApiNoContentResponse, ApiTags } from '@nestjs/swagger';
import { UpdateRoleRequestDto } from './dtos/update-role-request.dto';
import {
  RoleService,
  RoleServiceToken,
} from '../domain/core/services/role.service';
import { CanAccessBy } from './decorators/can-access-by.decorator';
import { AccessRights } from '../domain/constants/role-def.enum';

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
    return this.roleService.findAccessControlView();
  }

  @CanAccessBy(AccessRights.EDIT_ACCESS_RIGHTS)
  @Put('/:id')
  @ApiNoContentResponse()
  async updateRole(
    @Param('id') roleId: string,
    @Body() updateRoleDto: UpdateRoleRequestDto,
  ) {
    await this.roleService.updateRole(roleId, updateRoleDto);
  }
}
