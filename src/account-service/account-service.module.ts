import { Module } from '@nestjs/common';
import { AuthController } from './registration/controllers/auth.controller';
import { AuthServiceImpl } from './registration/services/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './registration/services/jwt.strategy';
import { TokenGeneratorImpl } from './registration/services/token-factory';
import { EnvironmentKeyFactory } from '../system/services';
import { PasswordManager } from './registration/services/password-manager';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleAuthorizationStrategy } from './authorization/services/role-authorization.strategy';
import { RoleServiceImpl } from './authorization/services/role.service';
import { RoleRepository } from './authorization/repositories/role.repository';
import { RoleController } from './authorization/controllers/role.controller';
import { Permission } from './domain/data-access/entities/permission.entity';
import { MonthlyMoneyModule } from '../monthly-money/internal/monthly-money.module';
import { UserController } from './management/controllers/user.controller';
import { UserServiceImpl } from './management/services/user.service';
import { UserRepository } from './management/repositories/user.repository';
import { AuthServiceToken, TokenFactoryToken } from './domain/core/services';
import { User } from './domain/data-access/entities/user.entity';
import { Role } from './domain/data-access/entities/role.entity';
import { RoleServiceToken } from './domain/core/services/role.service';
import { UserServiceToken } from './domain/core/services/user-service';
import { UserGroupsController } from './management/controllers/user-groups.controller';
import { UserGroupsServiceToken } from './domain/core/services/user-groups.service';
import { UserGroupsServiceImpl } from './management/services/user-groups.service';
import { UserGroup } from './domain/data-access/entities/user-group.entity';
import { PeriodController } from '../master-data-service/periods/period.controller';
import { DepartmentsController } from '../master-data-service/departments/departments.controller';
import { MasterDataServiceModule } from '../master-data-service/master-data-service.module';

@Module({
  imports: [
    MonthlyMoneyModule,
    JwtModule.registerAsync({
      useFactory: (environmentKeyFactory: EnvironmentKeyFactory) =>
        environmentKeyFactory.getJwtConfig(),
      inject: [EnvironmentKeyFactory],
    }),
    MasterDataServiceModule,
    TypeOrmModule.forFeature([User, Role, Permission, UserGroup]),
  ],
  controllers: [
    AuthController,
    RoleController,
    UserController,
    UserGroupsController,
    PeriodController,
    DepartmentsController,
  ],
  providers: [
    JwtStrategy,
    PasswordManager,
    RoleAuthorizationStrategy,
    RoleRepository,
    UserRepository,
    {
      provide: AuthServiceToken,
      useClass: AuthServiceImpl,
    },
    {
      provide: TokenFactoryToken,
      useClass: TokenGeneratorImpl,
    },
    {
      provide: RoleServiceToken,
      useClass: RoleServiceImpl,
    },
    {
      provide: UserServiceToken,
      useClass: UserServiceImpl,
    },
    {
      provide: UserGroupsServiceToken,
      useClass: UserGroupsServiceImpl,
    },
  ],
  exports: [PasswordManager, UserServiceToken, RoleServiceToken],
})
export class AccountServiceModule {}
