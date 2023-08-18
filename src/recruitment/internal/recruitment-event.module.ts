import { Module } from '@nestjs/common';
import { RecruitmentEventService } from './recruitment-event.service';
import { RecruitmentEventController } from './recruitment-event.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecruitmentEventRepository } from './recruitment-event.repository';
import { UserModule } from '../../user/internal/user.module';
import { RecruitmentEmployeeRepository } from './recruitment-employee.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RecruitmentEventRepository,
      RecruitmentEmployeeRepository,
    ]),
    UserModule,
  ],
  controllers: [RecruitmentEventController],
  providers: [RecruitmentEventService],
})
export class RecruitmentEventModule {}
