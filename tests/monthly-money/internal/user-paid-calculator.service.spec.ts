import { Test, TestingModule } from '@nestjs/testing';
import { MonthlyMoneyOperationRepository } from '../../../src/monthly-money/internal/monthly-money-operation.repository';
import { UserPaidCalculator } from '../../../src/monthly-money/internal/user-paid-calculator.service';
import { PaymentRepository } from '../../../src/monthly-money/internal/payment.repository';
import { Payment } from '../../../src/system/database/entities/payment.entity';
import { PaymentCreatedEvent } from '../../../src/monthly-money/domain/core/events/payment-created.event';

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
          useValue: { update: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(UserPaidCalculator);
    paymentRepository = module.get(PaymentRepository);
    operationFeeRepository = module.get(MonthlyMoneyOperationRepository);
  });

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
      operationFeeId: 10,
      amount: 200,
      note: 'payment',
      paidAt: new Date().toISOString(),
      userId: 'user-123',
      monthlyConfig: { id: 99, amount: 100, monthRange: 12 },
    };

    await service.handleUserPaidEvent(event);

    expect(paymentRepository.findUserPaymentsByUserId).toHaveBeenCalledWith(
      'user-123',
    );
    expect(operationFeeRepository.update).toHaveBeenCalledWith(
      { id: 10 },
      { paidMonths: 3, remainMonths: 9 },
    );
  });

  it('should handle when user has not paid anything', async () => {
    paymentRepository.findUserPaymentsByUserId.mockResolvedValue([]);

    const event: PaymentCreatedEvent = {
      id: 2,
      operationFeeId: 20,
      amount: 0,
      note: '',
      paidAt: new Date().toISOString(),
      userId: 'user-456',
      monthlyConfig: { id: 50, amount: 50, monthRange: 6 },
    };

    await service.handleUserPaidEvent(event);

    expect(operationFeeRepository.update).toHaveBeenCalledWith(
      { id: 20 },
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
      operationFeeId: 30,
      amount: 500,
      note: 'big pay',
      paidAt: new Date().toISOString(),
      userId: 'user-789',
      monthlyConfig: { id: 77, amount: 100, monthRange: 5 },
    };

    await service.handleUserPaidEvent(event);

    expect(operationFeeRepository.update).toHaveBeenCalledWith(
      { id: 30 },
      { paidMonths: 7, remainMonths: -2 },
    );
  });
});
