import { MonthlyMoneyConfig, MonthlyMoneyConfigService } from '../client';
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
}
