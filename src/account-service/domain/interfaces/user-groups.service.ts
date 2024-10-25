import { createInterfaceToken } from 'src/system/utils';
import {
  CreateUserGroupInput,
  GetUserGroupInputDto,
} from '../inputs/user-group.input';
import { UserGroup } from '../entities/user-group.entity';
import { Page } from '../../../system/query-shape/types';

export const UserGroupsServiceToken = createInterfaceToken(
  'UserGroupsServiceToken',
);

export interface UserGroupsService {
  createUserGroup(createUserGroupInput: CreateUserGroupInput): Promise<void>;
  findUserGroups(
    getUserGroupInputDto: GetUserGroupInputDto,
  ): Promise<Page<UserGroup>>;
  deleteUserGroup(id: number): Promise<void>;
}
