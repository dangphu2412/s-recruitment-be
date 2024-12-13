import { Module } from '@nestjs/common';
import { MonthlyMoneyConfigServiceImpl } from './monthly-money-config.service';
import { MonthlyMoneyController } from './monthly-money.controller';
import { MonthlyMoneyOperationServiceImpl } from './monthly-money-operation.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MonthlyMoneyOperationRepository } from './monthly-money-operation.repository';
import { PaymentService } from './payment.service';
import { PaymentRepository } from './payment.repository';
import { Payment } from '../domain/data-access/entities/payment.entity';
import { UserPaidCalculator } from './user-paid-calculator.service';
import { OperationFee } from '../domain/data-access/entities/operation-fee.entity';
import { MonthlyMoneyConfig } from '../domain/data-access/entities/monthly-money-config.entity';
import { MonthlyMoneyConfigServiceToken } from '../domain/core/services/monthly-money-config.service';
import { MonthlyMoneyOperationServiceToken } from '../domain/core/services/monthly-money-operation.service';

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
