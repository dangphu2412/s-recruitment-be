import { Module } from '@nestjs/common';
import {
  PeriodController,
  PeriodCRUDService,
} from './periods/period.controller';
import {
  DepartmentCRUDService,
  DepartmentsController,
} from './departments/departments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from './departments/department.entity';
import { Period } from './periods/period.entity';
import {
  TimeOfDayCRUDService,
  TimeOfDaysController,
} from './time-of-days/time-of-days.controller';
import {
  DayOfWeekCRUDServiceContainer,
  DayOfWeeksController,
} from './day-of-weeks/day-of-weeks.controller';
import { DayOfWeek } from './day-of-weeks/day-of-week';
import { TimeOfDay } from './time-of-days/time-of-day.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Department, Period, DayOfWeek, TimeOfDay]),
  ],
  controllers: [
    PeriodController,
    DepartmentsController,
    TimeOfDaysController,
    DayOfWeeksController,
  ],
  providers: [
    PeriodCRUDService.createProvider(),
    DepartmentCRUDService.createProvider(),
    TimeOfDayCRUDService.createProvider(),
    DayOfWeekCRUDServiceContainer.createProvider(),
  ],
  exports: [
    PeriodCRUDService.token,
    DepartmentCRUDService.token,
    TimeOfDayCRUDService.token,
    DepartmentCRUDService.token,
  ],
})
export class MasterDataServiceModule {}
