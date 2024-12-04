import { Controller, Get, Inject } from '@nestjs/common';
import {
  DepartmentService,
  DepartmentServiceToken,
} from '../domain/core/services/department.service';

@Controller('departments')
export class DepartmentsController {
  constructor(
    @Inject(DepartmentServiceToken)
    private readonly departmentService: DepartmentService,
  ) {}

  @Get()
  async getDepartments() {
    return this.departmentService.findDepartments();
  }
}
