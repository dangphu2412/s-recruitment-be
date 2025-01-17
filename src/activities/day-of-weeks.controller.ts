import { Controller, Get, Inject } from '@nestjs/common';
import {
  createCRUDService,
  ResourceCRUDService,
} from '../system/resource-templates/resource-service-template';
import { DayOfWeek } from './domain/data-access/day-of-week';

export const DayOfWeekCRUDServiceContainer = createCRUDService(DayOfWeek);

@Controller('day-of-weeks')
export class DayOfWeeksController {
  constructor(
    @Inject(DayOfWeekCRUDServiceContainer.token)
    private readonly dayResourceCRUDService: ResourceCRUDService<DayOfWeek>,
  ) {}

  @Get()
  find() {
    return this.dayResourceCRUDService.find();
  }
}
