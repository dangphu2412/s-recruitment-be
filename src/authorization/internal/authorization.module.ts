import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleServiceImpl } from './role.service';
import { RoleRepository } from './repositories/role.repository';
import { AccessRightStorageImpl } from './role-storage';
import { RoleAuthorizationStrategy } from './strategies/role-authorization.strategy';
import { RoleServiceToken, RoleStorageToken } from '../client';
import { RoleController } from '@authorization/internal/role.controller';
import { PermissionRepository } from '@authorization/internal/repositories/permission.repository';

@Module({
  imports: [
    CacheModule.register(),
    TypeOrmModule.forFeature([RoleRepository, PermissionRepository]),
  ],
  controllers: [RoleController],
  providers: [
    RoleAuthorizationStrategy,
    {
      provide: RoleServiceToken,
      useClass: RoleServiceImpl,
    },
    {
      provide: RoleStorageToken,
      useClass: AccessRightStorageImpl,
    },
  ],
  exports: [RoleServiceToken, RoleStorageToken],
})
export class AuthorizationModule {}
