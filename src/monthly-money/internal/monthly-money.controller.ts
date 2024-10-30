import { Controller, Get, Inject } from '@nestjs/common';
import {
  MonthlyMoneyConfigService,
  MonthlyMoneyConfigServiceToken,
} from '../domain/core/services/monthly-money-config.service';

@Controller({
  version: '1',
  path: 'monthly-money-configs',
})
export class MonthlyMoneyController {
  constructor(
    @Inject(MonthlyMoneyConfigServiceToken)
    private readonly monthlyConfigService: MonthlyMoneyConfigService,
  ) {}

  @Get()
  findAllConfigs() {
    return this.monthlyConfigService.findAll();
  }
}
