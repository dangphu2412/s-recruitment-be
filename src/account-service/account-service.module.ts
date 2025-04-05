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
import { Permission } from './shared/entities/permission.entity';
import { MonthlyMoneyModule } from '../monthly-money/internal/monthly-money.module';
import { UserController } from './management/controllers/user.controller';
import { UserServiceImpl } from './management/services/user.service';
import { UserRepository } from './management/repositories/user.repository';
import { User } from './shared/entities/user.entity';
import { Role } from './shared/entities/role.entity';
import { RoleServiceToken } from './authorization/interfaces/role-service.interface';
import { UserServiceToken } from './management/interfaces/user-service.interface';
import { MasterDataServiceModule } from '../master-data-service/master-data-service.module';
import { AuthServiceToken } from './registration/interfaces/auth-service.interface';
import { TokenFactoryToken } from './registration/interfaces/token-factory.interface';

@Module({
  imports: [
    MonthlyMoneyModule,
    JwtModule.registerAsync({
      useFactory: (environmentKeyFactory: EnvironmentKeyFactory) =>
        environmentKeyFactory.getJwtConfig(),
      inject: [EnvironmentKeyFactory],
    }),
    MasterDataServiceModule,
    TypeOrmModule.forFeature([User, Role, Permission]),
  ],
  controllers: [AuthController, RoleController, UserController],
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
  ],
  exports: [PasswordManager, UserServiceToken, RoleServiceToken],
})
export class AccountServiceModule {}
