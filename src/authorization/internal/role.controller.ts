import { Controller, Get, Inject } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  AccessRights,
  CanAccessBy,
  RoleService,
  RoleServiceToken,
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

  @CanAccessBy(AccessRights.VIEW_ACCESS_RIGHTS)
  @Get()
  getRoles() {
    return this.roleService.findAccessControlList();
  }
}
