import { AccessRightMap } from '../types/role.types';
import { createInterfaceToken } from '../../../utils';

export const RoleStorageToken = createInterfaceToken('RoleStorage');

export interface AccessRightStorage {
  set(userId: string, rights: string[]): Promise<void>;
  get(userId: string): Promise<AccessRightMap>;
  clean(userId: string): Promise<void>;
}
