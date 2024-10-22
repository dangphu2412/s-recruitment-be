import { Module } from '@nestjs/common';
import { AuthController } from '../adapters/auth.controller';
import { AuthServiceImpl } from '../app/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '../adapters/strategies/jwt.strategy';
import { TokenGeneratorImpl } from '../app/token-generator';
import { EnvironmentKeyFactory } from '../../system/services';
import { PasswordManager } from '../app/password-manager';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleAuthorizationStrategy } from '../adapters/strategies/role-authorization.strategy';
import { RoleServiceImpl } from '../app/role.service';
import { RoleRepository } from '../app/role.repository';
import { RoleController } from '../adapters/role.controller';
import { Permission } from '../domain/entities/permission.entity';
import { MonthlyMoneyModule } from '../../monthly-money/internal/monthly-money.module';
import { UserController } from '../adapters/user.controller';
import { UserServiceImpl } from '../app/user.service';
import { UserRepository } from '../app/user.repository';
import { AuthServiceToken, TokenGeneratorToken } from '../domain/interfaces';
import { User } from '../domain/entities/user.entity';
import { Role } from '../domain/entities/role.entity';
import { RoleServiceToken } from '../domain/interfaces/role.service';
import { UserServiceToken } from '../domain/interfaces/user-service';

@Module({
  imports: [
    MonthlyMoneyModule,
    JwtModule.registerAsync({
      useFactory: (environmentKeyFactory: EnvironmentKeyFactory) =>
        environmentKeyFactory.getJwtConfig(),
      inject: [EnvironmentKeyFactory],
    }),
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
      provide: TokenGeneratorToken,
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
