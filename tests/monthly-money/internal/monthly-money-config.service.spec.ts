import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { MonthlyMoneyConfigServiceImpl } from '../../../src/monthly-money/internal/monthly-money-config.service';
import { MonthlyMoneyConfig } from '../../../src/monthly-money/domain/data-access/entities/monthly-money-config.entity';

describe('MonthlyMoneyConfigServiceImpl', () => {
  let service: MonthlyMoneyConfigServiceImpl;
  let repository: jest.Mocked<Repository<MonthlyMoneyConfig>>;

  beforeEach(async () => {
    // Arrange
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MonthlyMoneyConfigServiceImpl,
        {
          provide: getRepositoryToken(MonthlyMoneyConfig),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(MonthlyMoneyConfigServiceImpl);
    repository = module.get(getRepositoryToken(MonthlyMoneyConfig));
  });

  describe('findAll', () => {
    it('should return all configs', async () => {
      // Arrange
      const expectedConfigs: MonthlyMoneyConfig[] = [
        { id: 1, amount: 1000 } as MonthlyMoneyConfig,
        { id: 2, amount: 2000 } as MonthlyMoneyConfig,
      ];
      repository.find.mockResolvedValue(expectedConfigs);

      // Act
      const result = await service.findAll();

      // Assert
      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual(expectedConfigs);
    });
  });

  describe('findById', () => {
    it('should return config when found', async () => {
      // Arrange
      const id = 1;
      const expectedConfig = { id, amount: 1500 } as MonthlyMoneyConfig;
      repository.findOne.mockResolvedValue(expectedConfig);

      // Act
      const result = await service.findById(id);

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id } });
      expect(result).toEqual(expectedConfig);
    });

    it('should throw NotFoundException when config not found', async () => {
      // Arrange
      const id = 99;
      repository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findById(id)).rejects.toThrow(NotFoundException);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id } });
    });
  });
});
