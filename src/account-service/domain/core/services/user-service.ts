import { createInterfaceToken } from 'src/system/utils';
import { Page } from 'src/system/query-shape/dto';
import { UserManagementViewDTO } from '../dto/users.dto';
import { CreateUsersDto } from '../../dtos/create-users.dto';
import { FileCreateUsersDto } from '../../dtos/file-create-users.dto';
import { User } from '../../data-access/entities/user.entity';
import { MyProfile, UserDetail } from '../../dtos/my-profile';
import { UpdateUserRolesDto } from '../../dtos/update-user-roles.dto';
import { PaginatedUserProbationDTO } from '../dto/user-probation.dto';
import { UserProbationQueryDTO } from '../dto/user-probation-query.dto';
import { UpgradeUserMemberDTO } from '../dto/upgrade-user-member.dto';
import { GetUserDTO, GetUsersDTO } from '../dto/get-users.dto';
import { UpdateUserDTO } from '../dto/update-user.dto';
import { GetUsersQueryDTO } from '../dto/get-users-query.dto';

export const UserServiceToken = createInterfaceToken('UserServiceToken');

export interface UserService {
  findMyProfile(id: string): Promise<MyProfile>;
  findUserDetail(id: string): Promise<UserDetail>;
  find(query: GetUsersDTO): Promise<User[]>;
  find(ids: string[]): Promise<User[]>;
  findOne(query: GetUserDTO): Promise<User>;
  findProbationUsers(
    userProbationQueryInput: UserProbationQueryDTO,
  ): Promise<PaginatedUserProbationDTO>;
  findUsers(query: GetUsersQueryDTO): Promise<Page<UserManagementViewDTO>>;

  /**
   * @throws {NotFoundUserException}
   */
  assertIdExist(id: string): Promise<void>;

  /**
   * @throws {InsertUserFailedException}
   */
  createUser(dto: CreateUsersDto): Promise<void>;
  createUsersByFile(
    dto: FileCreateUsersDto,
  ): Promise<{ duplicatedEmails: string[] }[]>;

  updateUserRoles(id: string, payload: UpdateUserRolesDto): Promise<void>;
  updateUser(dto: UpdateUserDTO): Promise<void>;
  upgradeToMembers(upgradeUserMemberInput: UpgradeUserMemberDTO): Promise<void>;
  toggleUserIsActive(id: string): Promise<void>;
}
