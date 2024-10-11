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

export const DomainUserToken = createInterfaceToken('DomainUser');

export interface DomainUser {
  findMyProfile(id: string): Promise<MyProfile>;
  findUserDetail(id: string): Promise<UserDetail>;
  find(query: UserQuery): Promise<User[]>;
  find(ids: string[]): Promise<User[]>;
  findOne(query: UserQuery): Promise<User>;

  isIdExist(id: string): Promise<boolean>;

  searchOverviewUsers(
    query: UserManagementQueryDto,
  ): Promise<Page<UserManagementView>>;

  /**
   * @throws {InsertUserFailedException}
   */
  createUserUseCase(dto: CreateUsersDto): Promise<void>;
  createUserUseCase(dto: FileCreateUsersDto): Promise<void>;

  updateUserRoles(id: string, payload: UpdateUserRolesDto): Promise<void>;

  toggleUserIsActive(id: string): Promise<void>;
}
