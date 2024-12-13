import { Controller, Get, Inject } from '@nestjs/common';
import {
  createResourceService,
  ResourceService,
} from '../system/resource-templates/resource-service-template';
import { TimeOfDay } from './domain/data-access/time-of-day.entity';

export const TimeOfDayServiceContainer = createResourceService(TimeOfDay);

@Controller('time-of-days')
export class TimeOfDaysController {
  constructor(
    @Inject(TimeOfDayServiceContainer.token)
    private readonly timeOfDayService: ResourceService<TimeOfDay>,
  ) {}

  @Get()
  findAll() {
    return this.timeOfDayService.findAll();
  }
}
