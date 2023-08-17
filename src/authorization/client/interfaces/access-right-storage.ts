import { createInterfaceToken } from '../../../system/utils';
import { Role } from 'src/authorization/client';

export const AccessRightStorageToken =
  createInterfaceToken('AccessRightStorage');

export interface AccessRightStorage {
  save(userId: string, roles: Role[]): Promise<string[]>;
  get(userId: string): Promise<string[] | undefined>;

  clean(userId: string): Promise<void>;
  clean(userIds: string[]): Promise<void>;
}
