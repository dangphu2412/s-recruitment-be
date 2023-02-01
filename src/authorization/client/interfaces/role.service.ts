import { AccessControlList, RoleOverview } from '@authorization/client';
import { createInterfaceToken } from '../../../utils';

export const RoleServiceToken = createInterfaceToken('RoleService');

export interface RoleService {
  findRoles(): Promise<RoleOverview>;
  findAccessControlListById(id: string): Promise<AccessControlList>;
}
