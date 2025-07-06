import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { UserActivityTrendRequest } from './user-trend.dto';
import {
  CanAccessBy,
  Identified,
} from '../account-service/account-service.package';
import { CurrentUser } from '../account-service/management/user.decorator';
import { MyActivityTrendGroupType } from './my-activity-trend.dto';
import { Permissions } from '../account-service/authorization/access-definition.constant';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @CanAccessBy(Permissions.READ_KPI)
  @Get('/kpi')
  findKPI() {
    return this.dashboardService.findKPI();
  }

  @Identified
  @Get('/kpi/me')
  findMyKPI(@CurrentUser('sub') userId: string) {
    return this.dashboardService.findMyKPI(userId);
  }

  @CanAccessBy(Permissions.READ_KPI)
  @Get('/user-activity-trends')
  findUserActivityTrends(@Query() query: UserActivityTrendRequest) {
    return this.dashboardService.findUserActivityTrends(query);
  }

  @Identified
  @Get('/user-activity-trends/me')
  findMyActivityTrends(
    @CurrentUser('sub') userId: string,
    @Query('groupType') groupType: MyActivityTrendGroupType,
  ) {
    return this.dashboardService.findMyActivityTrends({
      groupType,
      userId,
    });
  }
}
