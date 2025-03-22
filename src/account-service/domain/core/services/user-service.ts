import { createInterfaceToken } from 'src/system/utils';
import { Page } from 'src/system/query-shape/dto';
import { UserManagementViewDTO } from '../../../management/controllers/users.dto';
import { CreateUsersRequestDTO } from '../../../management/controllers/create-users.request';
import { FileCreateUsersDto } from '../../../management/controllers/file-create-users.dto';
import { User } from '../../data-access/entities/user.entity';
import {
  MyProfile,
  UserDetail,
} from '../../../management/dtos/core/my-profile';
import { UpdateUserRolesDto } from '../../../management/controllers/update-user-roles.dto';
import { PaginatedUserProbationDTO } from '../../../management/dtos/core/user-probation.dto';
import { UserProbationQueryDTO } from '../../../management/dtos/core/user-probation-query.dto';
import { UpgradeUserMemberDTO } from '../../../management/dtos/core/upgrade-user-member.dto';
import {
  GetUserDTO,
  GetUsersDTO,
} from '../../../management/dtos/core/get-users.dto';
import { UpdateUserDTO } from '../../../management/dtos/core/update-user.dto';
import { GetUsersQueryDTO } from '../../../management/dtos/core/get-users-query.dto';
import { CreatePaymentRequest } from '../../../management/controllers/create-payment.request';

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
  createUser(dto: CreateUsersRequestDTO): Promise<void>;
  createUsersByFile(
    dto: FileCreateUsersDto,
  ): Promise<{ duplicatedEmails: string[] }[]>;
  createUserPayment(id: string, dto: CreatePaymentRequest): Promise<void>;

  updateUserRoles(id: string, payload: UpdateUserRolesDto): Promise<void>;
  updateUser(dto: UpdateUserDTO): Promise<void>;
  upgradeToMembers(upgradeUserMemberInput: UpgradeUserMemberDTO): Promise<void>;
  toggleUserIsActive(id: string): Promise<void>;
}
