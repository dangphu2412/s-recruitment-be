import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleServiceImpl } from './role.service';
import { RoleRepository } from './repositories/role.repository';
import { AccessRightStorageImpl } from './role-storage';
import { RoleAuthorizationStrategy } from './strategies/role-authorization.strategy';
import { AccessRightStorageToken, Role, RoleServiceToken } from '../client';
import { RoleController } from 'src/authorization/internal/role.controller';
import { Permission } from '../client/entities/permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission])],
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
    RoleRepository,
  ],
  exports: [RoleServiceToken, AccessRightStorageToken],
})
export class AuthorizationModule {}
