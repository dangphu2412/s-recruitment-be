import { AccessControlList, AccessControlView } from '@authorization/client';
import { createInterfaceToken } from '../../../utils';
import { UpdateRoleDto } from '@authorization/client/dto';

export const RoleServiceToken = createInterfaceToken('RoleService');

export interface RoleService {
  findAccessControlView(): Promise<AccessControlView>;
  findAccessControlList(): Promise<AccessControlList>;
  updateRole(id: string, dto: UpdateRoleDto): Promise<void>;
}
