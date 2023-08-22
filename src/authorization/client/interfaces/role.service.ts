import { AccessControlView, Role } from 'src/authorization/client';
import { createInterfaceToken } from '../../../system/utils';
import { UpdateRoleDto } from 'src/authorization/client/dto';

export const RoleServiceToken = createInterfaceToken('RoleService');

export interface RoleService {
  findAccessControlView(): Promise<AccessControlView>;
  findByIds(ids: number[]): Promise<Role[]>;
  updateRole(id: string, dto: UpdateRoleDto): Promise<void>;
}
