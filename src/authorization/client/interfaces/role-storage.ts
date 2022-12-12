import { Role } from '@authorization/client';
import { RoleMapByActiveState } from '../types/role.types';
import { createInterfaceToken } from '../../../utils';

export const RoleStorageToken = createInterfaceToken('RoleStorage');

export interface RoleStorage {
  set(userId: string, roles: Role[]): Promise<void>;
  get(userId: string): Promise<RoleMapByActiveState>;
  clean(userId: string): Promise<void>;
}
