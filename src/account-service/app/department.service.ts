import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from '../domain/data-access/entities/department.entity';
import { DepartmentService } from '../domain/core/services/department.service';

@Injectable()
export class DepartmentServiceImpl implements DepartmentService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
  ) {}

  async findDepartments(): Promise<Department[]> {
    return this.departmentRepository.find();
  }
}
