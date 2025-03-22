import { createInterfaceToken } from 'src/system/utils';
import { GetUserGroupRequest } from '../../../management/controllers/user-group.request';
import { UserGroup } from '../../data-access/entities/user-group.entity';
import { Page } from '../../../../system/query-shape/types';
import { CreateUserGroupDTO } from '../../../management/dtos/core/create-user-group.dto';

export const UserGroupsServiceToken = createInterfaceToken(
  'UserGroupsServiceToken',
);

export interface UserGroupsService {
  createUserGroup(createUserGroupInput: CreateUserGroupDTO): Promise<void>;
  findUserGroups(
    getUserGroupInputDto: GetUserGroupRequest,
  ): Promise<Page<UserGroup>>;
  deleteUserGroup(id: number): Promise<void>;
}
