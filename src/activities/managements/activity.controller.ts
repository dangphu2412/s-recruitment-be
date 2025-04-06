import { Controller, Get, Inject, Query } from '@nestjs/common';
import { CanAccessBy } from '../../account-service/authorization/can-access-by.decorator';
import { Permissions } from '../../account-service/authorization/access-definition.constant';
import {
  ActivityService,
  ActivityServiceToken,
} from '../domain/core/services/activity.service';
import { FindActivitiesRequest } from '../domain/presentation/dtos/find-activities.request';

@Controller('activities')
export class ActivityController {
  constructor(
    @Inject(ActivityServiceToken)
    private readonly activityService: ActivityService,
  ) {}

  @CanAccessBy(Permissions.READ_ACTIVITIES)
  @Get()
  findActivities(@Query() query: FindActivitiesRequest) {
    return this.activityService.findActivities(query);
  }
}
