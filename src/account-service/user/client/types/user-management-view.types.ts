import { User } from '../entities/user.entity';
import { UserManagementQueryDto } from '../dtos/user-management-query.dto';
import { PageRequest } from 'src/system/query-shape/types';

export type UserManagementView = Omit<User, 'password' | 'roles'>;

export type UserManagementQuery = Required<UserManagementQueryDto> &
  PageRequest;

export type DebtorManagementQuery = Omit<
  Required<UserManagementQueryDto>,
  keyof PageRequest
> & {
  userIds: string[];
};
