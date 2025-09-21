import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MonthlyMoneyConfig } from '../../system/database/entities/monthly-money-config.entity';
import { MonthlyMoneyConfigService } from '../domain/core/services/monthly-money-config.service';
import { NotFoundException } from '@nestjs/common';

export class MonthlyMoneyConfigServiceImpl
  implements MonthlyMoneyConfigService
{
  constructor(
    @InjectRepository(MonthlyMoneyConfig)
    private readonly monthlyMoneyConfigRepository: Repository<MonthlyMoneyConfig>,
  ) {}

  findAll(): Promise<MonthlyMoneyConfig[]> {
    return this.monthlyMoneyConfigRepository.find();
  }

  async findById(id: number): Promise<MonthlyMoneyConfig> {
    const monthMoneyConfig = await this.monthlyMoneyConfigRepository.findOne({
      where: {
        id,
      },
    });

    if (!monthMoneyConfig) {
      throw new NotFoundException();
    }

    return monthMoneyConfig;
  }
}
