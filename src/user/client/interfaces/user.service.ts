import { MyProfile } from '@authentication/client';
import { User } from '../entities/user.entity';
import { createInterfaceToken } from '../../../utils';
import { CreateUsersDto } from '../dtos/create-users.dto';
import { FileCreateUsersDto } from '../dtos/file-create-users.dto';

export const UserServiceToken = createInterfaceToken('UserService');

export interface UserService {
  findById(id: string): Promise<User | null>;
  findById(id: string, relations: string[]): Promise<User | null>;

  findByUsername(username: string): Promise<User>;
  findByUsername(username: string, relations: string[]): Promise<User>;

  findMyProfile(id: string): Promise<MyProfile>;

  extractNewUserEmails(emails: string[]): Promise<string[]>;

  /**
   * @throws {InsertUserFailedException}
   */
  createUserUseCase(dto: CreateUsersDto): Promise<void>;
  createUserUseCase(dto: FileCreateUsersDto): Promise<void>;

  toggleUserIsActive(id: string): Promise<void>;
}
