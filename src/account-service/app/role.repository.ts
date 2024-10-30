import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { AccessControlList } from '../domain/dtos/role-list.dto';
import { Role } from '../domain/data-access/entities/role.entity';

@Injectable()
export class RoleRepository extends Repository<Role> {
  constructor(
    @InjectRepository(Role)
    repository: Repository<Role>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  findAccessControlList(): Promise<AccessControlList> {
    return this.find({
      relations: ['permissions'],
    }) as Promise<AccessControlList>;
  }
}
