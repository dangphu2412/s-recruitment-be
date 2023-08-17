import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleServiceImpl } from './role.service';
import { RoleRepository } from './repositories/role.repository';
import { AccessRightStorageImpl } from './role-storage';
import { RoleAuthorizationStrategy } from './strategies/role-authorization.strategy';
import { AccessRightStorageToken, RoleServiceToken } from '../client';
import { RoleController } from 'src/authorization/internal/role.controller';
import { PermissionRepository } from 'src/authorization/internal/repositories/permission.repository';

@Module({
  imports: [TypeOrmModule.forFeature([RoleRepository, PermissionRepository])],
  controllers: [RoleController],
  providers: [
    RoleAuthorizationStrategy,
    {
      provide: RoleServiceToken,
      useClass: RoleServiceImpl,
    },
    {
      provide: AccessRightStorageToken,
      useClass: AccessRightStorageImpl,
    },
  ],
  exports: [RoleServiceToken, AccessRightStorageToken],
})
export class AuthorizationModule {}
