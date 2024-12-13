import { Module } from '@nestjs/common';
import { AuthController } from './adapters/auth.controller';
import { AuthServiceImpl } from './app/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './adapters/strategies/jwt.strategy';
import { TokenGeneratorImpl } from './app/token-factory';
import { EnvironmentKeyFactory } from '../system/services';
import { PasswordManager } from './app/password-manager';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleAuthorizationStrategy } from './adapters/strategies/role-authorization.strategy';
import { RoleServiceImpl } from './app/role.service';
import { RoleRepository } from './app/role.repository';
import { RoleController } from './adapters/role.controller';
import { Permission } from './domain/data-access/entities/permission.entity';
import { MonthlyMoneyModule } from '../monthly-money/internal/monthly-money.module';
import { UserController } from './adapters/user.controller';
import { UserServiceImpl } from './app/user.service';
import { UserRepository } from './app/user.repository';
import { AuthServiceToken, TokenFactoryToken } from './domain/core/services';
import { User } from './domain/data-access/entities/user.entity';
import { Role } from './domain/data-access/entities/role.entity';
import { RoleServiceToken } from './domain/core/services/role.service';
import { UserServiceToken } from './domain/core/services/user-service';
import { UserGroupsController } from './adapters/user-groups.controller';
import { UserGroupsServiceToken } from './domain/core/services/user-groups.service';
import { UserGroupsServiceImpl } from './app/user-groups.service';
import { UserGroup } from './domain/data-access/entities/user-group.entity';
import { PeriodController } from './adapters/period.controller';
import { DepartmentsController } from './adapters/departments.controller';
import { DepartmentServiceToken } from './domain/core/services/department.service';
import { DepartmentServiceImpl } from './app/department.service';
import { PeriodServiceToken } from './domain/core/services/period.service';
import { PeriodServiceImpl } from './app/period.service';
import { Department } from './domain/data-access/entities/department.entity';
import { Period } from './domain/data-access/entities/period.entity';

@Module({
  imports: [
    MonthlyMoneyModule,
    JwtModule.registerAsync({
      useFactory: (environmentKeyFactory: EnvironmentKeyFactory) =>
        environmentKeyFactory.getJwtConfig(),
      inject: [EnvironmentKeyFactory],
    }),
    TypeOrmModule.forFeature([
      User,
      Role,
      Permission,
      UserGroup,
      Department,
      Period,
    ]),
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
    {
      provide: DepartmentServiceToken,
      useClass: DepartmentServiceImpl,
    },
    {
      provide: PeriodServiceToken,
      useClass: PeriodServiceImpl,
    },
  ],
  exports: [PasswordManager, UserServiceToken, RoleServiceToken],
})
export class AccountServiceModule {}
