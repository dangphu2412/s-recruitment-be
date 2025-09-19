import { Controller, Get, Inject } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CanAccessBy } from '../can-access-by.decorator';
import { Permissions } from '../access-definition.constant';
import { PermissionService } from '../interfaces/permission-service.interface';

@ApiTags('permissions')
@Controller({
  version: '1',
  path: '/permissions',
})
export class PermissionController {
  constructor(
    @Inject(PermissionService)
    private readonly permissionService: PermissionService,
  ) {}

  @CanAccessBy(Permissions.READ_IAM)
  @Get()
  findAll() {
    return this.permissionService.findAll();
  }
}
