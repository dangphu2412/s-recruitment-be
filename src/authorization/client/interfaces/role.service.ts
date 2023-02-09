import { AccessControlList } from '@authorization/client';
import { createInterfaceToken } from '../../../utils';
import { UpdateRoleDto } from '@authorization/client/dto';

export const RoleServiceToken = createInterfaceToken('RoleService');

export interface RoleService {
  findAccessControlList(): Promise<AccessControlList>;
  updateRole(id: string, dto: UpdateRoleDto): Promise<void>;
}
