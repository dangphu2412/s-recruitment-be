import { Test, TestingModule } from '@nestjs/testing';
import { MonthlyMoneyOperationServiceImpl } from '../../../src/monthly-money/internal/monthly-money-operation.service';
import { MonthlyMoneyOperationRepository } from '../../../src/monthly-money/internal/monthly-money-operation.repository';
import {
  MonthlyMoneyConfigService,
  MonthlyMoneyConfigServiceToken,
} from '../../../src/monthly-money/domain/core/services/monthly-money-config.service';
import { OperationFee } from '../../../src/monthly-money/domain/data-access/entities/operation-fee.entity';
import {
  CreateMoneyFeeDTO,
  CreateMoneyFeeResultsDTO,
} from '../../../src/monthly-money/domain/core/dto/create-money-fee.dto';

describe('MonthlyMoneyOperationServiceImpl', () => {
  let service: MonthlyMoneyOperationServiceImpl;
  let operationFeeRepository: jest.Mocked<MonthlyMoneyOperationRepository>;
  let moneyConfigService: jest.Mocked<MonthlyMoneyConfigService>;

  beforeEach(async () => {
    // Arrange
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MonthlyMoneyOperationServiceImpl,
        {
          provide: MonthlyMoneyOperationRepository,
          useValue: {
            findOne: jest.fn(),
            insert: jest.fn(),
          },
        },
        {
          provide: MonthlyMoneyConfigServiceToken,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(MonthlyMoneyOperationServiceImpl);
    operationFeeRepository = module.get(MonthlyMoneyOperationRepository);
    moneyConfigService = module.get(MonthlyMoneyConfigServiceToken);
  });

  describe('findOperationFeeWithMoneyConfigById', () => {
    it('should return operation fee with monthlyConfig relation', async () => {
      // Arrange
      const id = 1;
      const expectedFee = { id, monthlyConfig: { id: 10 } } as OperationFee;
      operationFeeRepository.findOne.mockResolvedValue(expectedFee);

      // Act
      const result = await service.findOperationFeeWithMoneyConfigById(id);

      // Assert
      expect(operationFeeRepository.findOne).toHaveBeenCalledWith({
        where: { id },
        relations: ['monthlyConfig'],
      });
      expect(result).toEqual(expectedFee);
    });
  });

  describe('createOperationFee', () => {
    it('should create operation fees for all userIds and return results', async () => {
      // Arrange
      const dto: CreateMoneyFeeDTO = {
        monthlyConfigId: 99,
        userIds: ['user-1', 'user-2'],
      };
      const mockConfig = { id: 99, monthRange: 12 } as any;

      moneyConfigService.findById.mockResolvedValue(mockConfig);
      operationFeeRepository.insert.mockResolvedValue({
        identifiers: [{ id: 123 }],
      } as any);

      // Act
      const result: CreateMoneyFeeResultsDTO =
        await service.createOperationFee(dto);

      // Assert
      expect(moneyConfigService.findById).toHaveBeenCalledWith(
        dto.monthlyConfigId,
      );
      expect(operationFeeRepository.insert).toHaveBeenCalledTimes(
        dto.userIds.length,
      );

      expect(result.items).toHaveLength(2);
      expect(result.items[0]).toEqual({
        userId: 'user-1',
        operationFeeId: 123,
      });
    });
  });
});
