import { Module } from '@nestjs/common';
import { MonthlyMoneyConfigServiceImpl } from './monthly-money-config.service';
import {
  MonthlyMoneyConfig,
  MonthlyMoneyConfigServiceToken,
  MonthlyMoneyOperationServiceToken,
  OperationFee,
} from '../client';
import { MonthlyMoneyController } from './monthly-money.controller';
import { MonthlyMoneyOperationServiceImpl } from './monthly-money-operation.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MonthlyMoneyOperationRepository } from './monthly-money-operation.repository';
import { PaymentService } from './payment.service';
import { PaymentRepository } from './payment.repository';
import { Payment } from '../client/entities/payment.entity';
import { UserPaidCalculator } from './user-paid-calculator.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([OperationFee, MonthlyMoneyConfig, Payment]),
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
    MonthlyMoneyOperationRepository,
    PaymentService,
    PaymentRepository,
    UserPaidCalculator,
  ],
  exports: [
    MonthlyMoneyConfigServiceToken,
    MonthlyMoneyOperationServiceToken,
    PaymentService,
  ],
})
export class MonthlyMoneyModule {}
