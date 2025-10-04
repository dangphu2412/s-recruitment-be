import { Module } from '@nestjs/common';
import { ActivityRequest } from '../system/database/entities/activity-request.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityController } from './managements/activity.controller';
import { ActivityRequestServiceImpl } from './requests/use-cases/activity-request.service';
import { ActivityRequestService } from './requests/use-cases/interfaces/activity-request.service';
import { Activity } from '../system/database/entities/activity.entity';
import { ActivityServiceImpl } from './managements/activity.service';
import { ActivityServiceToken } from './managements/interfaces/activity.service';
import { ActivityRepository } from './managements/activity.repository';
import { ActivityLog } from '../system/database/entities/activity-log.entity';
import { ActivityLogRepository } from './work-logs/infras/activity-log.repository';
import { ActivityLogServiceImpl } from './work-logs/application/activity-log.service';
import { ActivitiesLogController } from './work-logs/presentation/activities-log.controller';
import {
  DeviceUserController,
  DeviceUserCRUDService,
} from './work-logs/presentation/device-user.controller';
import { ActivityMatcher } from './work-logs/application/work-status-evaluator.service';
import { MasterDataServiceModule } from '../master-data-service/master-data-service.module';
import { ActivityRequestController } from './requests/presentation/activity-request.controller';
import { AccountServiceModule } from '../account-service/account-service.module';
import { DeviceUser } from '../system/database/entities/user-log.entity';
import { GCSFingerPrintRepository } from './work-logs/infras/gcs-fingerprint-repository';
import {
  ActivityRequestRepository,
  ActivityRequestRepositoryImpl,
} from './requests/infras/repositories/activity-request.repository';
import { MailModule } from '../system/mail/mail.module';
import { ActivityRequestAggregateRepositoryImpl } from './requests/infras/repositories/activity-request-aggregate.repository';
import { ActivityRequestAggregateRepository } from './requests/domain/repositories/activity-request-aggregate.repository';
import { ActivityRequestQueryService } from './requests/use-cases/interfaces/activity-request-query.service';
import { ActivityRequestQueryServiceImpl } from './requests/use-cases/activity-request-query.service';
import { ActivityLogService } from './work-logs/application/interfaces/activity-log.service';
import { FingerPrintLogsRepository } from './work-logs/application/interfaces/finger-print-logs.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Activity,
      ActivityRequest,
      ActivityLog,
      DeviceUser,
    ]),
    MasterDataServiceModule,
    AccountServiceModule,
    MailModule,
  ],
  controllers: [
    ActivityController,
    ActivitiesLogController,
    DeviceUserController,
    ActivityRequestController,
  ],
  providers: [
    {
      provide: ActivityRequestService,
      useClass: ActivityRequestServiceImpl,
    },
    {
      provide: ActivityRequestQueryService,
      useClass: ActivityRequestQueryServiceImpl,
    },
    {
      provide: ActivityServiceToken,
      useClass: ActivityServiceImpl,
    },
    {
      provide: ActivityRequestRepository,
      useClass: ActivityRequestRepositoryImpl,
    },
    {
      provide: ActivityRequestAggregateRepository,
      useClass: ActivityRequestAggregateRepositoryImpl,
    },
    DeviceUserCRUDService.createProvider(),
    ActivityRepository,
    ActivityLogRepository,
    {
      provide: ActivityLogService,
      useClass: ActivityLogServiceImpl,
    },
    ActivityMatcher,
    {
      provide: FingerPrintLogsRepository,
      useClass: GCSFingerPrintRepository,
    },
  ],
})
export class ActivityModule {}
