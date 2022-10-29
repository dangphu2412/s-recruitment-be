import { Role } from '../entities/role.entity';
import { createInterfaceToken } from '../../../utils';

export const RoleServiceToken = createInterfaceToken('RoleService');

export interface RoleService {
  getNewUserRoles(): Promise<Role[]>;
}
