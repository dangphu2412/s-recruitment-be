import { Permission } from 'src/account-service/shared/entities/permission.entity';
import { PermissionService } from '../interfaces/permission-service.interface';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PermissionServiceImpl implements PermissionService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  findAll(): Promise<Permission[]> {
    return this.permissionRepository.find();
  }
}
