import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { UserActivityTrendRequest } from './user-trend.dto';
import { Identified } from '../account-service/account-service.package';
import { CurrentUser } from '../account-service/management/user.decorator';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Identified
  @Get('/kpi')
  findKPI() {
    return this.dashboardService.findKPI();
  }

  @Identified
  @Get('/kpi/me')
  findMyKPI(@CurrentUser('sub') userId: string) {
    return this.dashboardService.findMyKPI(userId);
  }

  @Identified
  @Get('/user-activity-trends')
  findUserActivityTrends(@Query() query: UserActivityTrendRequest) {
    return this.dashboardService.findUserActivityTrends(query);
  }
}
