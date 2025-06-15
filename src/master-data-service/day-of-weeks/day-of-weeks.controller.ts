import { Controller, Get, Inject } from '@nestjs/common';
import {
  createCRUDService,
  ResourceCRUDService,
} from '../../system/resource-templates/resource-service-template';
import { DayOfWeek } from './day-of-week';
import { Identified } from '../../account-service/registration/identified.decorator';

export const DayOfWeekCRUDServiceContainer = createCRUDService(DayOfWeek);

@Controller('day-of-weeks')
export class DayOfWeeksController {
  constructor(
    @Inject(DayOfWeekCRUDServiceContainer.token)
    private readonly dayResourceCRUDService: ResourceCRUDService<DayOfWeek>,
  ) {}

  @Identified
  @Get()
  find() {
    return this.dayResourceCRUDService.find();
  }
}
