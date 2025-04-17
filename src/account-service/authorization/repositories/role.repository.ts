import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Role } from '../../shared/entities/role.entity';
import { AccessControlList } from '../dtos/aggregates/access-control-list.aggregate';

@Injectable()
export class RoleRepository extends Repository<Role> {
  constructor(
    @InjectRepository(Role)
    repository: Repository<Role>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  findAccessControlList(): Promise<AccessControlList> {
    return this.createQueryBuilder('roles')
      .leftJoinAndSelect('roles.permissions', 'permissions')
      .getMany() as Promise<AccessControlList>;
  }
}
