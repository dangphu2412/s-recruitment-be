import { Role } from '../../../domain/data-access/entities/role.entity';

export type AccessControlList = (Required<Pick<Role, 'permissions'>> &
  Omit<Role, 'permissions'>)[];
