import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserServiceToken, DomainUserToken } from '../client';
import { DomainUserImpl } from './domain.user';
import { UserRepository } from './user.repository';
import { MonthlyMoneyModule } from '../../monthly-money/internal/monthly-money.module';
import { UserServiceImpl } from './user.service';
import { AuthorizationModule } from 'src/authorization/internal/authorization.module';
import { UserController } from './user.controller';

@Module({
  imports: [
    AuthorizationModule,
    MonthlyMoneyModule,
    TypeOrmModule.forFeature([UserRepository]),
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
  ],
  exports: [DomainUserToken, UserServiceToken],
})
export class UserModule {}
