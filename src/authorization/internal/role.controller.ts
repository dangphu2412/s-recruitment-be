import { Controller, Get, Inject } from '@nestjs/common';
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
  getAccessControlList() {
    return this.roleService.getAccessControlList();
  }
}
