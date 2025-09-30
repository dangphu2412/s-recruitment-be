import { Permission } from 'src/system/database/entities/permission.entity';
import { PermissionService } from '../interfaces/permission-service.interface';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Permissions } from '../access-definition.constant';

@Injectable()
export class PermissionServiceImpl implements PermissionService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  findAll(): Promise<Permission[]> {
    return this.permissionRepository.find();
  }

  async findMy(userId: string): Promise<Permission[]> {
    const permissions = await this.permissionRepository.find({
      where: {
        roles: {
          users: {
            id: userId,
          },
        },
      },
    });

    if (
      permissions.some((permission) => permission.code === Permissions.OWNER)
    ) {
      return this.permissionRepository.find();
    }

    return permissions;
  }
}
