import { Test, TestingModule } from '@nestjs/testing';
import { PaymentController } from '../../../src/monthly-money/internal/payment.controller';
import { PaymentService } from '../../../src/monthly-money/internal/payment.service';

describe('PaymentController', () => {
  let controller: PaymentController;
  let paymentService: jest.Mocked<PaymentService>;

  beforeEach(async () => {
    // Arrange
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentController],
      providers: [
        {
          provide: PaymentService,
          useValue: {
            findMyPayments: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PaymentController>(PaymentController);
    paymentService = module.get(PaymentService);
  });

  describe('findMyPayments', () => {
    it('should return user payments by userId', async () => {
      // Arrange
      const userId = 'user-123';

      const expectedPayments = {
        items: [
          {
            id: 1,
            amount: 500,
            paidAt: new Date(),
            note: '',
            userId: 'userId',
            user: null,
          },
          {
            id: 2,
            amount: 1200,
            paidAt: new Date(),
            note: '',
            userId: 'userId',
            user: null,
          },
        ],
        metadata: {
          page: 1,
          size: 10,
          totalRecords: 0,
          totalPages: 0,
        },
      };
      paymentService.findMyPayments.mockResolvedValue(expectedPayments);

      // Act
      const result = await controller.findMyPayments(userId);

      // Assert
      expect(paymentService.findMyPayments).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedPayments);
    });
  });
});
