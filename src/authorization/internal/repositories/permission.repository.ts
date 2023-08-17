import { EntityRepository, Repository } from 'typeorm';
import { Permission } from 'src/authorization/client/entities/permission.entity';

@EntityRepository(Permission)
export class PermissionRepository extends Repository<Permission> {}
