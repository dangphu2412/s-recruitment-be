import { Controller, Get, Inject } from '@nestjs/common';
import {
  createResourceService,
  ResourceService,
} from '../system/resource-templates/resource-service-template';
import { DayOfWeek } from './domain/data-access/day-of-week';

export const DayOfWeekServiceContainer = createResourceService(DayOfWeek);

@Controller('day-of-weeks')
export class DayOfWeeksController {
  constructor(
    @Inject(DayOfWeekServiceContainer.token)
    private readonly dayResourceService: ResourceService<DayOfWeek>,
  ) {}

  @Get()
  findAll() {
    return this.dayResourceService.findAll();
  }
}
