import { Test, TestingModule } from '@nestjs/testing';
import { MonthlyMoneyController } from '../../../src/monthly-money/internal/monthly-money.controller';
import {
  MonthlyMoneyConfigService,
  MonthlyMoneyConfigServiceToken,
} from '../../../src/monthly-money/domain/core/services/monthly-money-config.service';

describe('MonthlyMoneyController', () => {
  let controller: MonthlyMoneyController;
  let monthlyConfigService: jest.Mocked<MonthlyMoneyConfigService>;

  beforeEach(async () => {
    // Arrange
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MonthlyMoneyController],
      providers: [
        {
          provide: MonthlyMoneyConfigServiceToken,
          useValue: {
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<MonthlyMoneyController>(MonthlyMoneyController);
    monthlyConfigService = module.get(MonthlyMoneyConfigServiceToken);
  });

  describe('findAllConfigs', () => {
    it('should return all configs', async () => {
      // Arrange
      const expectedConfigs = [
        { id: 1, amount: 1000, monthRange: 12, operationFees: [] },
        { id: 2, amount: 2000, monthRange: 12, operationFees: [] },
      ];
      monthlyConfigService.findAll.mockResolvedValue(expectedConfigs);

      // Act
      const result = await controller.findAllConfigs();

      // Assert
      expect(monthlyConfigService.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedConfigs);
    });
  });
});
