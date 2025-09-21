import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import {
  createCRUDService,
  ResourceCRUDService,
} from '../../system/resource-templates/resource-service-template';
import { Department } from '../../system/database/entities/department.entity';
import { IsString } from 'class-validator';
import { Identified } from '../../account-service/registration/identified.decorator';
import { CanAccessBy } from '../../account-service/authorization/can-access-by.decorator';
import { Permissions } from '../../account-service/authorization/access-definition.constant';

export const DepartmentCRUDService = createCRUDService(Department);

class CreateDepartmentDTO {
  @IsString()
  id: string;
  @IsString()
  name: string;
  @IsString()
  description: string;
}

@Controller('departments')
export class DepartmentsController {
  constructor(
    @Inject(DepartmentCRUDService.token)
    private readonly departmentService: ResourceCRUDService<Department>,
  ) {}

  @Identified
  @Get()
  async find() {
    return this.departmentService.find();
  }

  @CanAccessBy(Permissions.WRITE_DEPARTMENTS)
  @Post()
  async createOne(@Body() dto: CreateDepartmentDTO) {
    return this.departmentService.createOne(dto);
  }
}
