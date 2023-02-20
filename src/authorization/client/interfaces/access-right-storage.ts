import { createInterfaceToken } from '../../../utils';

export const AccessRightStorageToken =
  createInterfaceToken('AccessRightStorage');

export interface AccessRightStorage {
  renew(userId: string): Promise<string[]>;
  get(userId: string): Promise<string[] | undefined>;

  clean(userId: string): Promise<void>;
  clean(userIds: string[]): Promise<void>;
}
