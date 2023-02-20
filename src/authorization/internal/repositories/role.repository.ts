import { EntityRepository, Repository } from 'typeorm';
import { AccessControlList, Role } from '../../client';

@EntityRepository(Role)
export class RoleRepository extends Repository<Role> {
  findAccessControlList(): Promise<AccessControlList> {
    return this.find({
      relations: ['permissions'],
    }) as Promise<AccessControlList>;
  }
}
