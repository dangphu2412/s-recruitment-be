import { Module } from '@nestjs/common';
import { ActivityRequest } from './domain/data-access/activity-request.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityController } from './managements/activity.controller';
import { ActivityRequestServiceImpl } from './requests/activity-request.service';
import { ActivityRequestServiceToken } from './domain/core/services/activity-request.service';
import { Activity } from './domain/data-access/activity.entity';
import { ActivityServiceImpl } from './managements/activity.service';
import { ActivityServiceToken } from './domain/core/services/activity.service';
import { ActivityRepository } from './managements/activity.repository';
import { ActivityLog } from './domain/data-access/activity-log.entity';
import { ActivityLogRepository } from './work-logs/activity-log.repository';
import { ActivityLogService } from './work-logs/activity-log.service';
import { ActivitiesLogController } from './work-logs/activities-log.controller';
import { ActivityMdmController } from './work-logs/activity-mdm.controller';
import { WorkStatusEvaluator } from './work-logs/work-status-evaluator.service';
import { MasterDataServiceModule } from '../master-data-service/master-data-service.module';
import { ActivityRequestController } from './requests/activity-request.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Activity, ActivityRequest, ActivityLog]),
    MasterDataServiceModule,
  ],
  controllers: [
    ActivityController,
    ActivitiesLogController,
    ActivityMdmController,
    ActivityRequestController,
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
    ActivityRepository,
    ActivityLogRepository,
    ActivityLogService,
    WorkStatusEvaluator,
  ],
})
export class ActivityModule {}
