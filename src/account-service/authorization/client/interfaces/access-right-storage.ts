import { createInterfaceToken } from '../../../../system/utils';
import { Role } from 'src/account-service/authorization/client/index';

export const AccessRightStorageToken =
  createInterfaceToken('AccessRightStorage');

export interface AccessRightStorage {
  save(userId: string, roles: Role[]): Promise<string[]>;
  get(userId: string): Promise<string[]>;

  clean(userId: string): Promise<void>;
  clean(userIds: string[]): Promise<void>;
}
