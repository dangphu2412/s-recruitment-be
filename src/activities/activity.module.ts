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
  TimeOfDayServiceContainer,
} from './time-of-days.controller';
import {
  DayOfWeeksController,
  DayOfWeekServiceContainer,
} from './day-of-weeks.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Activity, ActivityRequest, DayOfWeek, TimeOfDay]),
  ],
  controllers: [ActivityController, TimeOfDaysController, DayOfWeeksController],
  providers: [
    {
      provide: ActivityRequestServiceToken,
      useClass: ActivityRequestServiceImpl,
    },
    {
      provide: ActivityServiceToken,
      useClass: ActivityServiceImpl,
    },
    TimeOfDayServiceContainer.createProvider(),
    DayOfWeekServiceContainer.createProvider(),
  ],
})
export class ActivityModule {}
