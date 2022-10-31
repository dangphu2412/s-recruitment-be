import { Controller, Get, Inject } from '@nestjs/common';
import {
  MonthlyMoneyConfigService,
  MonthlyMoneyConfigServiceToken,
} from '../client';

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
  findConfigs() {
    return this.monthlyConfigService.find();
  }
}
