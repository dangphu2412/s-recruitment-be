import { Controller, Get, Inject } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  CanAccessBy,
  RoleService,
  RoleServiceToken,
  SystemRoles,
} from '@authorization/client';

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

  @CanAccessBy(SystemRoles.CHAIRMAN)
  @Get()
  getRoles() {
    return this.roleService.findAccessControlList();
  }
}
