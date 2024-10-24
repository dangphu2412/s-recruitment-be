import { createInterfaceToken } from 'src/system/utils';
import { UserManagementQueryDto } from '../dtos/user-management-query.dto';
import { Page } from 'src/system/query-shape/dto';
import { UserManagementView } from '../vos/user-management-view.vo';
import { CreateUsersDto } from '../dtos/create-users.dto';
import { FileCreateUsersDto } from '../dtos/file-create-users.dto';
import { UserQuery } from '../vos/user-service.vo';
import { User } from '../entities/user.entity';
import { MyProfile, UserDetail } from '../dtos/my-profile';
import { UpdateUserRolesDto } from '../dtos/update-user-roles.dto';
import { UserProbationOutput } from '../output/user-probation.output';
import { UserProbationQueryInput } from '../inputs/user-probation-query.input';
import { UpgradeUserMemberInput } from '../inputs/upgrade-user-member.input';

export const UserServiceToken = createInterfaceToken('UserServiceToken');

export interface UserService {
  findMyProfile(id: string): Promise<MyProfile>;
  findUserDetail(id: string): Promise<UserDetail>;
  find(query: UserQuery): Promise<User[]>;
  find(ids: string[]): Promise<User[]>;
  findOne(query: UserQuery): Promise<User>;
  findProbationUsers(
    userProbationQueryInput: UserProbationQueryInput,
  ): Promise<UserProbationOutput>;

  isIdExist(id: string): Promise<boolean>;

  searchOverviewUsers(
    query: UserManagementQueryDto,
  ): Promise<Page<UserManagementView>>;

  /**
   * @throws {InsertUserFailedException}
   */
  createUser(dto: CreateUsersDto): Promise<void>;
  createUsersByFile(dto: FileCreateUsersDto): Promise<void>;

  updateUserRoles(id: string, payload: UpdateUserRolesDto): Promise<void>;
  upgradeToMembers(
    upgradeUserMemberInput: UpgradeUserMemberInput,
  ): Promise<void>;
  toggleUserIsActive(id: string): Promise<void>;
}
