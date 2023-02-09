import { createInterfaceToken } from '../../../utils';
import { Role } from '@authorization/client';

export const AccessRightStorageToken =
  createInterfaceToken('AccessRightStorage');

export interface AccessRightStorage {
  save(userId: string, roles: Role[]): Promise<void>;
  get(userId: string): Promise<string[]>;

  clean(userId: string): Promise<void>;
  clean(userIds: string[]): Promise<void>;
}
