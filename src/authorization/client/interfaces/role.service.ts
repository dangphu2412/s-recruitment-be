import { AccessControlView } from '@authorization/client';
import { createInterfaceToken } from '../../../utils';
import { UpdateRoleDto } from '@authorization/client/dto';

export const RoleServiceToken = createInterfaceToken('RoleService');

export interface RoleService {
  findAccessControlView(): Promise<AccessControlView>;
  updateRole(id: string, dto: UpdateRoleDto): Promise<void>;
}
