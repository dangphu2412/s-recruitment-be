import { Inject, Injectable } from '@nestjs/common';
import { PaymentRepository } from './payment.repository';
import {
  MonthlyMoneyOperationService,
  MonthlyMoneyOperationServiceToken,
} from '../domain/core/services/monthly-money-operation.service';
import { CreatePaymentDTO } from '../domain/core/dto/create-payment.dto';
import { Payment } from '../domain/data-access/entities/payment.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PAYMENT_CREATED_EVENT } from '../domain/core/events/payment-created.event';

@Injectable()
export class PaymentService {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly eventEmitter: EventEmitter2,
    @Inject(MonthlyMoneyOperationServiceToken)
    private readonly operationFeeService: MonthlyMoneyOperationService,
  ) {}

  async createPayment(dto: CreatePaymentDTO) {
    const operation = await this.operationFeeService.findOperationByUserId(
      dto.userId,
    );

    const entity = new Payment();
    entity.amount = dto.amount;
    entity.monthlyConfigId = operation.monthlyConfigId;
    entity.userId = dto.userId;
    entity.note = dto.note;
    entity.paidAt = new Date(dto.paidAt);

    await this.paymentRepository.insert(entity);

    this.eventEmitter.emit(PAYMENT_CREATED_EVENT, entity);
  }

  findUserPaymentsByUserId(userId: string) {
    return this.paymentRepository.findUserPaymentsByUserId(userId);
  }
}
