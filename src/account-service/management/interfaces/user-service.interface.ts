import { createProviderToken } from 'src/system/nestjs-extensions';
import { OffsetPaginationResponse } from 'src/system/pagination';
import { CreateUsersRequestDTO } from '../dtos/presentations/create-users.request';
import { FileCreateUsersDto } from '../dtos/presentations/file-create-users.dto';
import { User } from '../../shared/entities/user.entity';
import { MyProfile, UserDetail } from '../dtos/core/my-profile';
import { UpdateUserRolesDto } from '../dtos/presentations/update-user-roles.dto';
import { PaginatedUserProbationDTO } from '../dtos/core/user-probation.dto';
import { UserProbationQueryDTO } from '../dtos/core/user-probation-query.dto';
import { UpgradeUserMemberDTO } from '../dtos/core/upgrade-user-member.dto';
import { GetUserDTO } from '../dtos/core/get-users.dto';
import { UpdateUserDTO } from '../dtos/core/update-user.dto';
import { GetUsersQueryDTO } from '../dtos/core/get-users-query.dto';
import { CreatePaymentRequest } from '../dtos/presentations/create-payment.request';
import { UserManagementViewDTO } from '../dtos/presentations/get-users-query.request';

export const UserServiceToken = createProviderToken('UserServiceToken');
export const UserService = Symbol('UserServiceToken');

export interface UserService {
  findMyProfile(id: string): Promise<MyProfile>;
  findUserDetail(id: string): Promise<UserDetail>;
  /**
   * @deprecated This API too abstract and not correctly used
   */
  findOne(query: GetUserDTO): Promise<User>;
  findById(id: string): Promise<User | null>;
  findProbationUsers(
    userProbationQueryInput: UserProbationQueryDTO,
  ): Promise<PaginatedUserProbationDTO>;
  findUsers(
    query: GetUsersQueryDTO,
  ): Promise<OffsetPaginationResponse<UserManagementViewDTO>>;
  findUsersByFullNames(fullNames: string[]): Promise<User[]>;

  /**
   * @throws {ConflictException}
   */
  createUser(dto: CreateUsersRequestDTO): Promise<void>;
  createUsersByFile(dto: FileCreateUsersDto): Promise<void>;
  createUserPayment(id: string, dto: CreatePaymentRequest): Promise<void>;

  updateUserRoles(id: string, payload: UpdateUserRolesDto): Promise<void>;
  updateUser(dto: UpdateUserDTO): Promise<void>;
  updateMyProfile(dto: UpdateUserDTO): Promise<void>;
  upgradeToMembers(upgradeUserMemberInput: UpgradeUserMemberDTO): Promise<void>;
  toggleUserIsActive(id: string): Promise<void>;
}
