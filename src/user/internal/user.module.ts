import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchUserServiceToken, UserServiceToken } from '../client';
import { UserServiceImpl } from './user.service';
import { UserRepository } from './user.repository';
import { MonthlyMoneyModule } from '../../monthly-money/internal/monthly-money.module';
import { SearchUserServiceImpl } from './search-user.service';
import { AuthorizationModule } from '@authorization/internal/authorization.module';
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
      provide: UserServiceToken,
      useClass: UserServiceImpl,
    },
    {
      provide: SearchUserServiceToken,
      useClass: SearchUserServiceImpl,
    },
  ],
  exports: [UserServiceToken, SearchUserServiceToken],
})
export class UserModule {}
