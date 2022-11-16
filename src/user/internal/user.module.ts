import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { SearchUserServiceToken, UserServiceToken } from '../client';
import { UserServiceImpl } from './user.service';
import { UserRepository } from './user.repository';
import { MonthlyMoneyModule } from '../../monthly-money/internal/monthly-money.module';
import { SearchUserServiceImpl } from './search-user.service';

@Module({
  imports: [MonthlyMoneyModule, TypeOrmModule.forFeature([UserRepository])],
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
  exports: [UserServiceToken],
})
export class UserModule {}
