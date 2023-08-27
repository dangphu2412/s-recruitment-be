import { Module } from '@nestjs/common';
import { RecruitmentEventService } from './recruitment-event.service';
import { RecruitmentEventController } from './recruitment-event.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../../user/internal/user.module';
import { RecruitmentEvent } from '../client/entities/recruitment-event.entity';
import { RecruitmentEmployee } from '../client/entities/recruitment-employee.entity';
import { EmployeeEventPoint } from '../client/entities/employee-event-point.entity';

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
  providers: [RecruitmentEventService],
})
export class RecruitmentEventModule {}
