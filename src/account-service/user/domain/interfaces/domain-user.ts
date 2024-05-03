import { MyProfile } from 'src/account-service/authentication';
import { createInterfaceToken } from 'src/system/utils';
import { UserDetail } from 'src/account-service/authentication';
import { UserManagementQueryDto } from '../dtos/user-management-query.dto';
import { Page } from 'src/system/query-shape/dto';
import { UserManagementView } from '../types/user-management-view.types';
import { CreateUsersDto } from '../dtos/create-users.dto';
import { FileCreateUsersDto } from '../dtos/file-create-users.dto';
import { UpdatableUserPayload } from '../types/user-service.types';

export const DomainUserToken = createInterfaceToken('DomainUser');

export interface DomainUser {
  findMyProfile(id: string): Promise<MyProfile>;
  findUserDetail(id: string): Promise<UserDetail>;

  search(query: UserManagementQueryDto): Promise<Page<UserManagementView>>;

  /**
   * @throws {InsertUserFailedException}
   */
  createUserUseCase(dto: CreateUsersDto): Promise<void>;
  createUserUseCase(dto: FileCreateUsersDto): Promise<void>;

  update(id: string, payload: UpdatableUserPayload): Promise<void>;

  toggleUserIsActive(id: string): Promise<void>;
}
