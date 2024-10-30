import { Module } from '@nestjs/common';
import { RecruitmentEventUseCaseAdapter } from './recruitment-event-adapter.service';
import { RecruitmentEventController } from './recruitment-event.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecruitmentEvent } from './domain/data-access/entities/recruitment-event.entity';
import { RecruitmentEmployee } from './domain/data-access/entities/recruitment-employee.entity';
import { EmployeeEventPoint } from './domain/data-access/entities/employee-event-point.entity';
import { RecruitmentEventServiceToken } from './domain/core/recruitment-event.service';
import { RecruitmentEventRepositoryToken } from './domain/data-access/recruitment-event.repository';
import { RecruitmentEventRepositoryAdapter } from './recruitment-event-repository.adapter';
import { AccountServiceModule } from '../account-service/account-service.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RecruitmentEvent,
      RecruitmentEmployee,
      EmployeeEventPoint,
    ]),
    AccountServiceModule,
  ],
  controllers: [RecruitmentEventController],
  providers: [
    {
      provide: RecruitmentEventServiceToken,
      useClass: RecruitmentEventUseCaseAdapter,
    },
    {
      provide: RecruitmentEventRepositoryToken,
      useClass: RecruitmentEventRepositoryAdapter,
    },
  ],
})
export class RecruitmentEventModule {}
