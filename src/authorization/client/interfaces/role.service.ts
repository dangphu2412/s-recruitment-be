import { AccessControlView, Role } from 'src/authorization/client';
import { createInterfaceToken } from '../../../utils';
import { UpdateRoleDto } from 'src/authorization/client/dto';
import { User } from '../../../user';

export const RoleServiceToken = createInterfaceToken('RoleService');

export interface RoleService {
  findAccessControlView(): Promise<AccessControlView>;
  findByIds(ids: number[]): Promise<Role[]>;
  updateRole(id: string, dto: UpdateRoleDto): Promise<void>;
  // TODO: Refactor two update methods
  // In microservice world, we just need to transfer userId and new roleIds for modify
  updateUserRoles(user: User, roleIds: number[]): Promise<void>;
}
