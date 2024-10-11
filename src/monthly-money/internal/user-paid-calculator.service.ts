import { Injectable } from '@nestjs/common';
import {
  PAYMENT_CREATED_EVENT,
  PaymentCreatedEvent,
} from '../client/events/payment-created.event';
import { OnEvent } from '@nestjs/event-emitter';
import { MonthlyMoneyOperationRepository } from './monthly-money-operation.repository';
import { PaymentRepository } from './payment.repository';

@Injectable()
export class UserPaidCalculator {
  constructor(
    private readonly operationFeeRepository: MonthlyMoneyOperationRepository,
    private readonly paymentRepository: PaymentRepository,
  ) {}

  @OnEvent(PAYMENT_CREATED_EVENT)
  async handleUserPaidEvent(payload: PaymentCreatedEvent) {
    const { monthlyConfig } = await this.operationFeeRepository.findOne({
      where: {
        userId: payload.userId,
      },
      relations: ['monthlyConfig'],
    });

    const userPayments = await this.paymentRepository.findUserPaymentsByUserId(
      payload.userId,
    );

    const totalPaid = userPayments.reduce(
      (acc, payment) => acc + payment.amount,
      0,
    );
    const totalMonths = Math.floor(totalPaid / monthlyConfig.amount);
    const remainMonths = monthlyConfig.monthRange - totalMonths;

    await this.operationFeeRepository.update(
      {
        userId: payload.userId,
      },
      {
        paidMonths: totalMonths,
        remainMonths: remainMonths,
      },
    );
  }
}
