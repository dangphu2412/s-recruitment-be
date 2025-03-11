import { Module } from '@nestjs/common';
import { ActivityRequest } from './domain/data-access/activity-request.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityController } from './activity.controller';
import { ActivityRequestServiceImpl } from './activity-request.service';
import { ActivityRequestServiceToken } from './domain/core/services/activity-request.service';
import { Activity } from './domain/data-access/activity.entity';
import { ActivityServiceImpl } from './activity.service';
import { ActivityServiceToken } from './domain/core/services/activity.service';
import { DayOfWeek } from './domain/data-access/day-of-week';
import { TimeOfDay } from './domain/data-access/time-of-day.entity';
import {
  TimeOfDaysController,
  TimeOfDayCRUDService,
} from './time-of-days.controller';
import {
  DayOfWeeksController,
  DayOfWeekCRUDServiceContainer,
} from './day-of-weeks.controller';
import { ActivityRepository } from './activity.repository';
import { ActivityLog } from './domain/data-access/activity-log.entity';
import { ActivityLogRepository } from './activity-log.repository';
import { ActivityLogService } from './activity-log.service';
import { ActivitiesLogController } from './activities-log.controller';
import { ActivityMdmController } from './activity-mdm.controller';
import { WorkStatusEvaluator } from './work-status-evaluator.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Activity,
      ActivityRequest,
      DayOfWeek,
      TimeOfDay,
      ActivityLog,
    ]),
  ],
  controllers: [
    ActivityController,
    ActivitiesLogController,
    TimeOfDaysController,
    DayOfWeeksController,
    ActivityMdmController,
  ],
  providers: [
    {
      provide: ActivityRequestServiceToken,
      useClass: ActivityRequestServiceImpl,
    },
    {
      provide: ActivityServiceToken,
      useClass: ActivityServiceImpl,
    },
    TimeOfDayCRUDService.createProvider(),
    DayOfWeekCRUDServiceContainer.createProvider(),
    ActivityRepository,
    ActivityLogRepository,
    ActivityLogService,
    WorkStatusEvaluator,
  ],
})
export class ActivityModule {}
