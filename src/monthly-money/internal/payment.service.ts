import { Inject, Injectable } from '@nestjs/common';
import { PaymentRepository } from './payment.repository';
import {
  MonthlyMoneyOperationService,
  MonthlyMoneyOperationServiceToken,
} from '../domain/core/services/monthly-money-operation.service';
import { CreatePaymentDTO } from '../domain/core/dto/create-payment.dto';
import { Payment } from '../domain/data-access/entities/payment.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  PAYMENT_CREATED_EVENT,
  PaymentCreatedEvent,
} from '../domain/core/events/payment-created.event';
import { OffsetPaginationResponse } from '../../system/pagination';

@Injectable()
export class PaymentService {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly eventEmitter: EventEmitter2,
    @Inject(MonthlyMoneyOperationServiceToken)
    private readonly operationFeeService: MonthlyMoneyOperationService,
  ) {}

  async createPayment(dto: CreatePaymentDTO) {
    const operationFee =
      await this.operationFeeService.findOperationFeeWithMoneyConfigById(
        dto.operationFeeId,
      );
    const entity = new Payment();

    entity.amount = dto.amount;
    entity.userId = dto.userId;
    entity.note = dto.note;
    entity.paidAt = new Date(dto.paidAt);

    await this.paymentRepository.insert(entity);

    const paymentCreatedEvent: PaymentCreatedEvent = {
      id: entity.id,
      amount: entity.amount,
      monthlyConfig: operationFee.monthlyConfig,
      note: entity.note,
      paidAt: entity.paidAt.toISOString(),
      userId: entity.userId,
      operationFeeId: operationFee.id,
    };

    this.eventEmitter.emit(PAYMENT_CREATED_EVENT, paymentCreatedEvent);
  }

  findUserPaymentsByUserId(userId: string) {
    return this.paymentRepository.findUserPaymentsByUserId(userId);
  }

  async findMyPayments(userId: string) {
    const items = await this.paymentRepository.find({
      where: {
        userId,
      },
    });

    return OffsetPaginationResponse.of({
      items,
      totalRecords: items.length,
      query: {
        page: 1,
        size: items.length,
      },
    });
  }
}
