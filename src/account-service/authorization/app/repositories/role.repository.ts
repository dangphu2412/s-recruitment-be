import { Repository } from 'typeorm';
import { AccessControlList, Role } from '../../domain';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';

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
