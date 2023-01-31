import { RoleRepository } from './repositories/role.repository';
import { Injectable } from '@nestjs/common';
import { AccessControlList, RoleService } from '../client';

@Injectable()
export class RoleServiceImpl implements RoleService {
  constructor(private readonly roleRepository: RoleRepository) {}

  getAccessControlList(): Promise<AccessControlList[]> {
    return this.roleRepository.find({
      relations: ['permissions'],
    }) as Promise<AccessControlList[]>;
  }
}
