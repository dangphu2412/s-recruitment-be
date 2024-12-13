import { Controller, Get, Inject } from '@nestjs/common';
import {
  PeriodService,
  PeriodServiceToken,
} from '../domain/core/services/period.service';

@Controller('periods')
export class PeriodController {
  constructor(
    @Inject(PeriodServiceToken)
    private readonly periodService: PeriodService,
  ) {}

  @Get()
  async getDepartments() {
    return this.periodService.findPeriods();
  }
}
