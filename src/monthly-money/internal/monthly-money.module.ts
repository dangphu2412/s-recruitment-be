import { Module } from '@nestjs/common';
import { MonthlyMoneyConfigServiceImpl } from './monthly-money-config.service';
import {
  MonthlyMoneyConfig,
  MonthlyMoneyConfigServiceToken,
  MonthlyMoneyOperationServiceToken,
} from '../client';
import { MonthlyMoneyController } from './monthly-money.controller';
import { MonthlyMoneyOperationServiceImpl } from './monthly-money-operation.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MonthlyMoneyOperationRepository } from './monthly-money-operation.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MonthlyMoneyOperationRepository,
      MonthlyMoneyConfig,
    ]),
  ],
  controllers: [MonthlyMoneyController],
  providers: [
    {
      provide: MonthlyMoneyConfigServiceToken,
      useClass: MonthlyMoneyConfigServiceImpl,
    },
    {
      provide: MonthlyMoneyOperationServiceToken,
      useClass: MonthlyMoneyOperationServiceImpl,
    },
  ],
  exports: [MonthlyMoneyConfigServiceToken, MonthlyMoneyOperationServiceToken],
})
export class MonthlyMoneyModule {}
