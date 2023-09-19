import {
  AccessControlView,
  Role,
} from 'src/account-service/authorization/client/index';
import { createInterfaceToken } from '../../../../system/utils';
import { UpdateRoleDto } from 'src/account-service/authorization/client/dto';

export const RoleServiceToken = createInterfaceToken('RoleService');

export interface RoleService {
  findAccessControlView(): Promise<AccessControlView>;
  findByIds(ids: number[]): Promise<Role[]>;
  updateRole(id: string, dto: UpdateRoleDto): Promise<void>;
}
