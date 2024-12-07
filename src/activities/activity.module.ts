import { Module } from '@nestjs/common';
import { ActivityRequest } from './domain/data-access/activity-request.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityController } from './activity.controller';
import { ActivityRequestServiceImpl } from './activity-request.service';
import { ActivityRequestServiceToken } from './domain/core/services/activity-request.service';
import { Activity } from './domain/data-access/activity.entity';
import { ActivityServiceImpl } from './activity.service';
import { ActivityServiceToken } from './domain/core/services/activity.service';

@Module({
  imports: [TypeOrmModule.forFeature([Activity, ActivityRequest])],
  controllers: [ActivityController],
  providers: [
    {
      provide: ActivityRequestServiceToken,
      useClass: ActivityRequestServiceImpl,
    },
    {
      provide: ActivityServiceToken,
      useClass: ActivityServiceImpl,
    },
  ],
})
export class ActivityModule {}
