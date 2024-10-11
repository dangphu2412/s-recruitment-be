import { Inject, Injectable } from '@nestjs/common';
import { PaymentRepository } from './payment.repository';
import {
  MonthlyMoneyOperationService,
  MonthlyMoneyOperationServiceToken,
} from '../client';
import { CreatePaymentCommand } from '../client/types/create-payment.types';
import { Payment } from '../client/entities/payment.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PAYMENT_CREATED_EVENT } from '../client/events/payment-created.event';

@Injectable()
export class PaymentService {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly eventEmitter: EventEmitter2,
    @Inject(MonthlyMoneyOperationServiceToken)
    private readonly operationFeeService: MonthlyMoneyOperationService,
  ) {}

  async createPayment(command: CreatePaymentCommand) {
    const operation = await this.operationFeeService.findOperationByUserId(
      command.userId,
    );

    const entity = new Payment();
    entity.amount = command.amount;
    entity.monthlyConfigId = operation.monthlyConfigId;
    entity.userId = command.userId;
    entity.note = command.note;
    entity.paidAt = new Date(command.paidAt);

    await this.paymentRepository.insert(entity);

    this.eventEmitter.emit(PAYMENT_CREATED_EVENT, entity);
  }

  findUserPaymentsByUserId(userId: string) {
    return this.paymentRepository.findUserPaymentsByUserId(userId);
  }
}
