import { Body, Controller, Get, Inject, Param, Put } from '@nestjs/common';
import { ApiNoContentResponse, ApiTags } from '@nestjs/swagger';
import { UpdateRoleRequestDto } from '../../management/controllers/update-role-request.dto';
import {
  RoleService,
  RoleServiceToken,
} from '../interfaces/role-service.interface';
import { CanAccessBy } from '../can-access-by.decorator';
import { Permissions } from '../access-definition.constant';

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

  @CanAccessBy(Permissions.VIEW_ACCESS_RIGHTS)
  @Get()
  getRoles() {
    return this.roleService.findAccessControlView();
  }

  @CanAccessBy(Permissions.EDIT_ACCESS_RIGHTS)
  @Put('/:id')
  @ApiNoContentResponse()
  async updateRole(
    @Param('id') roleId: string,
    @Body() updateRoleDto: UpdateRoleRequestDto,
  ) {
    await this.roleService.updateRole(roleId, updateRoleDto);
  }
}
