import { EntityRepository, Repository } from 'typeorm';
import { Role } from '../../client';

@EntityRepository(Role)
export class PermissionRepository extends Repository<Role> {}
