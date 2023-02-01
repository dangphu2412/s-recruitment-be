import { EntityRepository, Repository } from 'typeorm';
import { Permission } from '@authorization/client/entities/permission.entity';

@EntityRepository(Permission)
export class PermissionRepository extends Repository<Permission> {}
