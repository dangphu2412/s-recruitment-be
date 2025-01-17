import { Injectable } from '@nestjs/common';
import {
  PAYMENT_CREATED_EVENT,
  PaymentCreatedEvent,
} from '../domain/core/events/payment-created.event';
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
  async handleUserPaidEvent(paymentCreatedEvent: PaymentCreatedEvent) {
    const userPayments = await this.paymentRepository.findUserPaymentsByUserId(
      paymentCreatedEvent.userId,
    );
    const totalPaid = userPayments.reduce(
      (acc, payment) => acc + payment.amount,
      0,
    );
    const { monthlyConfig } = paymentCreatedEvent;
    const totalMonths = Math.floor(totalPaid / monthlyConfig.amount);
    const remainMonths = monthlyConfig.monthRange - totalMonths;

    await this.operationFeeRepository.update(
      {
        id: paymentCreatedEvent.operationFeeId,
      },
      {
        paidMonths: totalMonths,
        remainMonths: remainMonths,
      },
    );
  }
}
