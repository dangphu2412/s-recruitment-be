import { Module } from '@nestjs/common';
import { AuthController } from '../adapters/auth.controller';
import { AuthServiceImpl } from '../app/auth.service';
import { UserModule } from '../../user/app/user.module';
import { AuthorizationModule } from '../../authorization/infrastructure/authorization.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '../adapters/strategies/jwt.strategy';
import { TokenGeneratorImpl } from '../app/token-generator';
import { AuthServiceToken, TokenGeneratorToken } from '../domain';
import { EnvironmentKeyFactory } from '../../../system/services';

@Module({
  imports: [
    UserModule,
    AuthorizationModule,
    JwtModule.registerAsync({
      useFactory: (environmentKeyFactory: EnvironmentKeyFactory) =>
        environmentKeyFactory.getJwtConfig(),
      inject: [EnvironmentKeyFactory],
    }),
  ],
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    {
      provide: AuthServiceToken,
      useClass: AuthServiceImpl,
    },
    {
      provide: TokenGeneratorToken,
      useClass: TokenGeneratorImpl,
    },
  ],
})
export class AuthModule {}
