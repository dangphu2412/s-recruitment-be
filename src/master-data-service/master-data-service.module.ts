import { Module } from '@nestjs/common';
import { PeriodCRUDService } from './periods/period.controller';
import { DepartmentCRUDService } from './departments/departments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from './departments/department.entity';
import { Period } from './periods/period.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Department, Period])],
  providers: [
    PeriodCRUDService.createProvider(),
    DepartmentCRUDService.createProvider(),
  ],
  exports: [PeriodCRUDService.token, DepartmentCRUDService.token],
})
export class MasterDataServiceModule {}
