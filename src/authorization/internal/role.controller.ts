import { Controller, Get, Inject, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RoleService, RoleServiceToken } from '@authorization/client';

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

  @Get()
  getRoles() {
    return this.roleService.findRoles();
  }

  @Get('/:id')
  getAccessControlList(@Param() id: string) {
    return this.roleService.findAccessControlListById(id);
  }
}
