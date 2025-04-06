import { Controller, Get, Inject } from '@nestjs/common';
import {
  createCRUDService,
  ResourceCRUDService,
} from '../../system/resource-templates/resource-service-template';
import { TimeOfDay } from './time-of-day.entity';

export const TimeOfDayCRUDService = createCRUDService(TimeOfDay);

@Controller('time-of-days')
export class TimeOfDaysController {
  constructor(
    @Inject(TimeOfDayCRUDService.token)
    private readonly timeOfDayService: ResourceCRUDService<TimeOfDay>,
  ) {}

  @Get()
  find() {
    return this.timeOfDayService.find();
  }
}
