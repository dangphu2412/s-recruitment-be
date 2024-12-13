import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MonthlyMoneyConfig } from '../domain/data-access/entities/monthly-money-config.entity';
import { MonthlyMoneyConfigService } from '../domain/core/services/monthly-money-config.service';
import { NoMonthlyMoneyConfigFoundException } from '../domain/core/exceptions';

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
      throw new NoMonthlyMoneyConfigFoundException();
    }

    return monthMoneyConfig;
  }
}
