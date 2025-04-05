import { Role } from '../../../shared/entities/role.entity';

export type AccessControlList = (Required<Pick<Role, 'permissions'>> &
  Omit<Role, 'permissions'>)[];
