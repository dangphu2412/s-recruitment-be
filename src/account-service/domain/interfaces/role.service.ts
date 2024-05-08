import { createInterfaceToken } from '../../../system/utils';
import { AccessControlView } from '../dtos/role-list.dto';
import { Role } from '../entities/role.entity';
import { UpdateRoleDto } from '../dtos/update-role.dto';

export const RoleServiceToken = createInterfaceToken('RoleService');

export interface RoleService {
  findAccessControlView(): Promise<AccessControlView>;
  findByIds(ids: number[]): Promise<Role[]>;
  updateRole(id: string, dto: UpdateRoleDto): Promise<void>;
}
