import { Test, TestingModule } from '@nestjs/testing';
import { PaymentRepository } from '../../../src/monthly-money/internal/payment.repository';
import { PaymentService } from '../../../src/monthly-money/internal/payment.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  MonthlyMoneyOperationService,
  MonthlyMoneyOperationServiceToken,
} from '../../../src/monthly-money/domain/core/services/monthly-money-operation.service';
import { CreatePaymentDTO } from '../../../src/monthly-money/domain/core/dto/create-payment.dto';
import { Payment } from '../../../src/monthly-money/domain/data-access/entities/payment.entity';
import { PAYMENT_CREATED_EVENT } from '../../../src/monthly-money/domain/core/events/payment-created.event';
import { OffsetPaginationResponse } from '../../../src/system/pagination';

describe('PaymentService', () => {
  let service: PaymentService;
  let paymentRepository: jest.Mocked<PaymentRepository>;
  let eventEmitter: jest.Mocked<EventEmitter2>;
  let operationFeeService: jest.Mocked<MonthlyMoneyOperationService>;

  beforeEach(async () => {
    // Arrange
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: PaymentRepository,
          useValue: {
            insert: jest.fn(),
            findUserPaymentsByUserId: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
        {
          provide: MonthlyMoneyOperationServiceToken,
          useValue: {
            findOperationFeeWithMoneyConfigById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(PaymentService);
    paymentRepository = module.get(PaymentRepository);
    eventEmitter = module.get(EventEmitter2);
    operationFeeService = module.get(MonthlyMoneyOperationServiceToken);
  });

  describe('createPayment', () => {
    it('should create payment, insert into repository, and emit event', async () => {
      // Arrange
      const paidAt = new Date().toISOString();
      const dto: CreatePaymentDTO = {
        amount: 100,
        userId: 'user-1',
        note: 'First payment',
        paidAt,
        operationFeeId: 10,
      };

      const mockOperationFee = {
        id: 10,
        monthlyConfig: { id: 99 },
      } as any;

      operationFeeService.findOperationFeeWithMoneyConfigById.mockResolvedValue(
        mockOperationFee,
      );
      paymentRepository.insert.mockResolvedValue({
        identifiers: [{ id: 1 }],
      } as any);

      // Act
      await service.createPayment(dto);

      // Assert
      expect(
        operationFeeService.findOperationFeeWithMoneyConfigById,
      ).toHaveBeenCalledWith(dto.operationFeeId);
      expect(paymentRepository.insert).toHaveBeenCalledWith(
        expect.any(Payment),
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith(PAYMENT_CREATED_EVENT, {
        id: undefined,
        amount: dto.amount,
        userId: dto.userId,
        note: dto.note,
        operationFeeId: mockOperationFee.id,
        monthlyConfig: mockOperationFee.monthlyConfig,
        paidAt: paidAt,
      });
    });
  });

  describe('findUserPaymentsByUserId', () => {
    it('should return payments from repository', async () => {
      // Arrange
      const userId = 'user-1';
      const expectedPayments = [{ id: 1 }, { id: 2 }] as any;
      paymentRepository.findUserPaymentsByUserId.mockResolvedValue(
        expectedPayments,
      );

      // Act
      const result = await service.findUserPaymentsByUserId(userId);

      // Assert
      expect(paymentRepository.findUserPaymentsByUserId).toHaveBeenCalledWith(
        userId,
      );
      expect(result).toEqual(expectedPayments);
    });
  });

  describe('findMyPayments', () => {
    it('should return paginated payments for user', async () => {
      // Arrange
      const userId = 'user-1';
      const items = [
        { id: 1, amount: 100 },
        { id: 2, amount: 200 },
      ] as Payment[];

      paymentRepository.find.mockResolvedValue(items);

      // Act
      const result = await service.findMyPayments(userId);

      // Assert
      expect(paymentRepository.find).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(result).toEqual(
        OffsetPaginationResponse.of({
          items,
          totalRecords: items.length,
          query: { page: 1, size: items.length },
        }),
      );
    });
  });
});
