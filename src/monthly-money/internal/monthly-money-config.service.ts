import {
  MonthlyMoneyConfig,
  MonthlyMoneyConfigService,
  NoMonthlyMoneyConfigFoundException,
} from '../client';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

export class MonthlyMoneyConfigServiceImpl
  implements MonthlyMoneyConfigService
{
  constructor(
    @InjectRepository(MonthlyMoneyConfig)
    private readonly monthlyMoneyConfigRepository: Repository<MonthlyMoneyConfig>,
  ) {}

  find(): Promise<MonthlyMoneyConfig[]> {
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
