import { createInterfaceToken } from '../../../../system/utils';
import { AccessControlView } from '../../../authorization/dtos/core/role-list.dto';
import { Role } from '../../data-access/entities/role.entity';
import { UpdateRoleDto } from '../../../authorization/dtos/core/update-role.dto';

export const RoleServiceToken = createInterfaceToken('RoleService');

export interface RoleService {
  findAccessControlView(): Promise<AccessControlView>;
  findByIds(ids: number[]): Promise<Role[]>;
  findAccessRightsByUserId(userId: string): Promise<string[]>;
  findByName(name: string): Promise<Role>;
  updateRole(id: string, dto: UpdateRoleDto): Promise<void>;
  save(userId: string, roles: Role[]): Promise<string[]>;
  clean(userId: string): Promise<void>;
  clean(userIds: string[]): Promise<void>;
}
