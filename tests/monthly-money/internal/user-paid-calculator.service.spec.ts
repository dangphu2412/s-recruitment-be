import { Test, TestingModule } from '@nestjs/testing';
import { MonthlyMoneyOperationRepository } from '../../../src/monthly-money/internal/monthly-money-operation.repository';
import { UserPaidCalculator } from '../../../src/monthly-money/internal/user-paid-calculator.service';
import { PaymentRepository } from '../../../src/monthly-money/internal/payment.repository';
import { Payment } from '../../../src/system/database/entities/payment.entity';
import { PaymentCreatedEvent } from '../../../src/monthly-money/domain/core/events/payment-created.event';
import { OperationFee } from '../../../src/system/database/entities/operation-fee.entity';

describe('UserPaidCalculator', () => {
  let service: UserPaidCalculator;
  let paymentRepository: jest.Mocked<PaymentRepository>;
  let operationFeeRepository: jest.Mocked<MonthlyMoneyOperationRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserPaidCalculator,
        {
          provide: PaymentRepository,
          useValue: { findUserPaymentsByUserId: jest.fn() },
        },
        {
          provide: MonthlyMoneyOperationRepository,
          useValue: { update: jest.fn(), findOne: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(UserPaidCalculator);
    paymentRepository = module.get(PaymentRepository);
    operationFeeRepository = module.get(MonthlyMoneyOperationRepository);
  });

  describe('calculateSummaryOfPayment', () => {
    it('should calculate total paid months and update operation fee', async () => {
      const payments: Payment[] = [
        {
          id: 1,
          amount: 100,
          paidAt: new Date(),
          note: '',
          userId: 'user-123',
          user: null,
        },
        {
          id: 2,
          amount: 200,
          paidAt: new Date(),
          note: 'second',
          userId: 'user-123',
          user: null,
        },
      ];

      paymentRepository.findUserPaymentsByUserId.mockResolvedValue(payments);

      const event: PaymentCreatedEvent = {
        id: 1,
        operationFeeId: 'user-123',
        amount: 200,
        note: 'payment',
        paidAt: new Date().toISOString(),
        userId: 'user-123',
        monthlyConfig: { id: 99, amount: 100, monthRange: 12 },
      };

      await service.calculateSummaryOfPayment(event);

      expect(paymentRepository.findUserPaymentsByUserId).toHaveBeenCalledWith(
        'user-123',
      );
      expect(operationFeeRepository.update).toHaveBeenCalledWith(
        { id: 'user-123' },
        { paidMonths: 3, remainMonths: 9 },
      );
    });

    it('should handle when user has not paid anything', async () => {
      paymentRepository.findUserPaymentsByUserId.mockResolvedValue([]);

      const event: PaymentCreatedEvent = {
        id: 2,
        operationFeeId: 'user-456',
        amount: 0,
        note: '',
        paidAt: new Date().toISOString(),
        userId: 'user-456',
        monthlyConfig: { id: 50, amount: 50, monthRange: 6 },
      };

      await service.calculateSummaryOfPayment(event);

      expect(operationFeeRepository.update).toHaveBeenCalledWith(
        { id: 'user-456' },
        { paidMonths: 0, remainMonths: 6 },
      );
    });

    it('should calculate correctly when total paid exceeds month range', async () => {
      const payments: Payment[] = [
        {
          id: 3,
          amount: 500,
          paidAt: new Date(),
          note: '',
          userId: 'user-789',
          user: null,
        },
        {
          id: 4,
          amount: 200,
          paidAt: new Date(),
          note: 'bonus',
          userId: 'user-789',
          user: null,
        },
      ];

      paymentRepository.findUserPaymentsByUserId.mockResolvedValue(payments);

      const event: PaymentCreatedEvent = {
        id: 3,
        operationFeeId: 'user-789',
        amount: 500,
        note: 'big pay',
        paidAt: new Date().toISOString(),
        userId: 'user-789',
        monthlyConfig: { id: 77, amount: 100, monthRange: 5 },
      };

      await service.calculateSummaryOfPayment(event);

      expect(operationFeeRepository.update).toHaveBeenCalledWith(
        { id: 'user-789' },
        { paidMonths: 7, remainMonths: -2 },
      );
    });
  });

  describe('recalculateSummaryPaymentWhenUserEarlyLeave', () => {
    it('should correctly recalculate remaining months when user leaves early', async () => {
      const userLeaveEvent = {
        id: 'user-1',
        joinedAt: new Date('2023-01-01'),
        leaveAt: new Date('2024-01-01'),
        leaveReason: 'Personal',
      };

      const mockPayments = [
        { id: 1, amount: 100 },
        { id: 2, amount: 100 },
        { id: 3, amount: 100 },
      ] as Payment[];

      const mockOperation = {
        id: 'user-1',
        monthlyConfig: {
          amount: 100,
          monthRange: 24,
        },
      } as OperationFee;

      paymentRepository.findUserPaymentsByUserId.mockResolvedValue(
        mockPayments,
      );
      operationFeeRepository.findOne.mockResolvedValue(mockOperation);

      await service.recalculateSummaryPaymentWhenUserEarlyLeave(userLeaveEvent);

      expect(paymentRepository.findUserPaymentsByUserId).toHaveBeenCalledWith(
        'user-1',
      );
      expect(operationFeeRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        relations: ['monthlyConfig'],
      });

      expect(operationFeeRepository.update).toHaveBeenCalledWith(
        { id: 'user-1' },
        { remainMonths: 9 },
      );
    });

    it('should handle case where user paid more than month range', async () => {
      const userLeaveEvent = {
        id: 'user-2',
        joinedAt: new Date('2023-01-01'),
        leaveAt: new Date('2023-12-01'),
        leaveReason: 'Contract End',
      };

      const mockPayments = Array.from({ length: 15 }, () => ({
        amount: 100,
      })) as Payment[];
      const mockOperation = {
        id: 'user-2',
        monthlyConfig: {
          amount: 100,
          monthRange: 12,
        },
      } as OperationFee;

      paymentRepository.findUserPaymentsByUserId.mockResolvedValue(
        mockPayments,
      );
      operationFeeRepository.findOne.mockResolvedValue(mockOperation);

      await service.recalculateSummaryPaymentWhenUserEarlyLeave(userLeaveEvent);

      expect(operationFeeRepository.update).toHaveBeenCalledWith(
        { id: 'user-2' },
        { remainMonths: -4 },
      );
    });
  });
});
