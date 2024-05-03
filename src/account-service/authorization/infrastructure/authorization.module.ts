import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleServiceImpl } from '../app/role.service';
import { RoleRepository } from '../app/repositories/role.repository';
import { AccessRightStorageImpl } from '../app/access-right-storage';
import { RoleAuthorizationStrategy } from '../adapters/strategies/role-authorization.strategy';
import { AccessRightStorageToken, Role, RoleServiceToken } from '../domain';
import { RoleController } from 'src/account-service/authorization/adapters/role.controller';
import { Permission } from '../domain/entities/permission.entity';

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
