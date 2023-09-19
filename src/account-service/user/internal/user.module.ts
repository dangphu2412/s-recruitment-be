import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserServiceToken, DomainUserToken, User } from '../client';
import { DomainUserImpl } from './domain.user';
import { UserRepository } from './user.repository';
import { MonthlyMoneyModule } from '../../../monthly-money/internal/monthly-money.module';
import { UserServiceImpl } from './user.service';
import { AuthorizationModule } from 'src/account-service/authorization/internal/authorization.module';
import { UserController } from './user.controller';

@Module({
  imports: [
    AuthorizationModule,
    MonthlyMoneyModule,
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [UserController],
  providers: [
    {
      provide: DomainUserToken,
      useClass: DomainUserImpl,
    },
    {
      provide: UserServiceToken,
      useClass: UserServiceImpl,
    },
    UserRepository,
  ],
  exports: [DomainUserToken, UserServiceToken],
})
export class UserModule {}
