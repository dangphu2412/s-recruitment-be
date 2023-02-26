import { MyProfile } from '@authentication/client';
import { User } from '../entities/user.entity';
import { createInterfaceToken } from '../../../utils';
import { CreateUsersDto } from '../dtos/create-users.dto';
import { FileCreateUsersDto } from '../dtos/file-create-users.dto';
import { UpdatableUserPayload } from '../types/user-service.types';
import { UserManagementQueryDto } from '../dtos/user-management-query.dto';
import { Page } from '@shared/query-shape/pagination/types';
import { UserManagementView } from '../types/user-management-view.types';

export const UserServiceToken = createInterfaceToken('UserService');

export interface UserService {
  findById(id: string): Promise<User | null>;
  findById(id: string, relations: string[]): Promise<User | null>;

  findByUsername(username: string): Promise<User>;
  findByUsername(username: string, relations: string[]): Promise<User>;

  findMyProfile(id: string): Promise<MyProfile>;

  search(query: UserManagementQueryDto): Promise<Page<UserManagementView>>;

  /**
   * @throws {InsertUserFailedException}
   */
  createUserUseCase(dto: CreateUsersDto): Promise<void>;
  createUserUseCase(dto: FileCreateUsersDto): Promise<void>;

  update(id: string, payload: UpdatableUserPayload): Promise<void>;

  toggleUserIsActive(id: string): Promise<void>;
}
