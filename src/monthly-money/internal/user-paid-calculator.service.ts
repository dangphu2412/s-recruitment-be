import { Injectable } from '@nestjs/common';
import {
  PAYMENT_CREATED_EVENT,
  PaymentCreatedEvent,
} from '../domain/core/events/payment-created.event';
import { OnEvent } from '@nestjs/event-emitter';
import { MonthlyMoneyOperationRepository } from './monthly-money-operation.repository';
import { PaymentRepository } from './payment.repository';
import {
  USER_LEAVE_EVENT,
  UserLeaveEvent,
} from '../../account-service/management/events/user-leave.event';
import { differenceInMonths } from 'date-fns';

@Injectable()
export class UserPaidCalculator {
  constructor(
    private readonly operationFeeRepository: MonthlyMoneyOperationRepository,
    private readonly paymentRepository: PaymentRepository,
  ) {}

  @OnEvent(PAYMENT_CREATED_EVENT)
  async calculateSummaryOfPayment(paymentCreatedEvent: PaymentCreatedEvent) {
    const totalPaidAmount = await this.sumTotalPaidAmountOfUser(
      paymentCreatedEvent.userId,
    );
    const { monthlyConfig } = paymentCreatedEvent;
    const totalMonths = Math.floor(totalPaidAmount / monthlyConfig.amount);
    const remainMonths = monthlyConfig.monthRange - totalMonths;

    await this.operationFeeRepository.update(
      {
        id: paymentCreatedEvent.userId,
      },
      {
        paidMonths: totalMonths,
        remainMonths: remainMonths,
      },
    );
  }

  @OnEvent(USER_LEAVE_EVENT)
  async recalculateSummaryPaymentWhenUserEarlyLeave(
    userLeaveEvent: UserLeaveEvent,
  ) {
    const totalPaidAmount = await this.sumTotalPaidAmountOfUser(
      userLeaveEvent.id,
    );
    const operation = await this.operationFeeRepository.findOne({
      where: {
        id: userLeaveEvent.id,
      },
      relations: ['monthlyConfig'],
    });
    const { monthlyConfig } = operation;
    const totalPaidMonths = Math.floor(totalPaidAmount / monthlyConfig.amount);
    const joinedMonthRange = Math.abs(
      differenceInMonths(userLeaveEvent.joinedAt, userLeaveEvent.leaveAt),
    );
    const remainMonths =
      Math.min(monthlyConfig.monthRange, joinedMonthRange) - totalPaidMonths;

    await this.operationFeeRepository.update(
      {
        id: userLeaveEvent.id,
      },
      {
        remainMonths: remainMonths,
      },
    );
  }

  private async sumTotalPaidAmountOfUser(userId: string) {
    const userPayments =
      await this.paymentRepository.findUserPaymentsByUserId(userId);

    return userPayments.reduce((acc, payment) => acc + payment.amount, 0);
  }
}
