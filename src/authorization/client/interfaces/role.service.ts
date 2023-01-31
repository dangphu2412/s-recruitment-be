import { AccessControlList } from '@authorization/client';
import { createInterfaceToken } from '../../../utils';

export const RoleServiceToken = createInterfaceToken('RoleService');

export interface RoleService {
  getAccessControlList(): Promise<AccessControlList[]>;
}
