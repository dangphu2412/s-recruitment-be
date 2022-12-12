import { RoleRepository } from './role.repository';
import { In } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { APP_RBAC } from './constants/role-def.enum';
import { Role, RoleService } from '../client';

@Injectable()
export class RoleServiceImpl implements RoleService {
  constructor(private readonly roleRepository: RoleRepository) {}

  getNewUserRoles(): Promise<Role[]> {
    return this.roleRepository.find({
      where: {
        key: In([APP_RBAC.MEMBER]),
      },
    });
  }
}
