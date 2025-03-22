import { Module } from '@nestjs/common';
import { ActivityRequest } from './domain/data-access/activity-request.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityController } from './activity.controller';
import { ActivityRequestServiceImpl } from './activity-request.service';
import { ActivityRequestServiceToken } from './domain/core/services/activity-request.service';
import { Activity } from './domain/data-access/activity.entity';
import { ActivityServiceImpl } from './activity.service';
import { ActivityServiceToken } from './domain/core/services/activity.service';
import { TimeOfDayCRUDService } from '../master-data-service/time-of-days/time-of-days.controller';
import { DayOfWeekCRUDServiceContainer } from '../master-data-service/day-of-weeks/day-of-weeks.controller';
import { ActivityRepository } from './activity.repository';
import { ActivityLog } from './domain/data-access/activity-log.entity';
import { ActivityLogRepository } from './activity-log.repository';
import { ActivityLogService } from './activity-log.service';
import { ActivitiesLogController } from './activities-log.controller';
import { ActivityMdmController } from './activity-mdm.controller';
import { WorkStatusEvaluator } from './work-status-evaluator.service';
import { MasterDataServiceModule } from '../master-data-service/master-data-service.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Activity, ActivityRequest, ActivityLog]),
    MasterDataServiceModule,
  ],
  controllers: [
    ActivityController,
    ActivitiesLogController,
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
