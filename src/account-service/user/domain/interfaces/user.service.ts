import { createInterfaceToken } from '../../../../system/utils';
import { UserQuery } from '../types/user-service.types';
import { User } from '../entities/user.entity';

export const UserServiceToken = createInterfaceToken('UserService');

export interface UserService {
  find(query: UserQuery): Promise<User[]>;
  find(ids: string[]): Promise<User[]>;
  findOne(query: UserQuery): Promise<User>;
}
