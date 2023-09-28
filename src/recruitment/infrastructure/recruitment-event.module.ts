import { Module } from '@nestjs/common';
import { RecruitmentEventUseCaseAdapter } from '../app/usecase/recruitment-event-adapter.service';
import { RecruitmentEventController } from './controllers/recruitment-event.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../../account-service/user/internal/user.module';
import { RecruitmentEvent } from '../domain/entities/recruitment-event.entity';
import { RecruitmentEmployee } from '../domain/entities/recruitment-employee.entity';
import { EmployeeEventPoint } from '../domain/entities/employee-event-point.entity';
import { RecruitmentEventUseCaseToken } from '../app/interfaces/recruitment-event.usecase';
import { RecruitmentEventRepositoryToken } from '../app/interfaces/recruitment-event.repository';
import { RecruitmentEventRepositoryAdapter } from './persistence/recruitment-event-repository.adapter';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RecruitmentEvent,
      RecruitmentEmployee,
      EmployeeEventPoint,
    ]),
    UserModule,
  ],
  controllers: [RecruitmentEventController],
  providers: [
    {
      provide: RecruitmentEventUseCaseToken,
      useClass: RecruitmentEventUseCaseAdapter,
    },
    {
      provide: RecruitmentEventRepositoryToken,
      useClass: RecruitmentEventRepositoryAdapter,
    },
  ],
})
export class RecruitmentEventModule {}
