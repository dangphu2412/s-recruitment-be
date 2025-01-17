import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import {
  createCRUDService,
  ResourceCRUDService,
} from '../../system/resource-templates/resource-service-template';
import { Department } from '../domain/data-access/entities/department.entity';
import { IsString } from 'class-validator';

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

  @Get()
  async find() {
    return this.departmentService.find();
  }

  @Post()
  async createOne(@Body() dto: CreateDepartmentDTO) {
    return this.departmentService.createOne(dto);
  }
}
