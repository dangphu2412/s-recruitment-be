import { Body, Controller, Get, Inject, Query } from '@nestjs/common';
import { CanAccessBy } from '../../account-service/authorization/can-access-by.decorator';
import { Permissions } from '../../account-service/authorization/access-definition.constant';
import {
  ActivityService,
  ActivityServiceToken,
} from './interfaces/activity.service';
import { FindActivitiesRequest } from './dtos/presentation/find-activities.request';
import { CurrentUserId } from '../../account-service/management/user.decorator';
import { SearchMyActivitiesRequest } from './dtos/presentation/search-my-activities.request';

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

  @CanAccessBy(Permissions.READ_ACTIVITIES)
  @Get('/my')
  searchMy(
    @Body() searchMyActivitiesRequest: SearchMyActivitiesRequest,
    @CurrentUserId userId: string,
  ) {
    return this.activityService.searchMy({
      ...searchMyActivitiesRequest,
      userId,
    });
  }
}
