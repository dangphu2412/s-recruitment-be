import { User } from '../entities/user.entity';
import { UserManagementQuery } from '../dtos/user-management-query.dto';
import { MyProfile } from '../../../authentication';
import { createInterfaceToken } from '../../../utils';
import { CreateUsersDto } from '../dtos/create-users.dto';

export const UserServiceToken = createInterfaceToken('UserService');

export interface UserService {
  find(query: UserManagementQuery): Promise<User[]>;
  count(query: UserManagementQuery): Promise<number>;

  findById(id: string): Promise<User | null>;
  findById(id: string, relations: string[]): Promise<User | null>;

  findByUsername(username: string): Promise<User>;
  findByUsername(username: string, relations: string[]): Promise<User>;

  findMyProfile(id: string): Promise<MyProfile>;

  extractNewUserEmails(emails: string[]): Promise<string[]>;

  /**
   * @throws {EmailExistedException}
   */
  assertEmailsNotExist(emails: string[]): Promise<void>;

  /**
   * @throws {InsertUserFailedException}
   */
  createNewbies(dto: CreateUsersDto): Promise<void>;
  createMembers(dto: CreateUsersDto): Promise<void>;
  createUserUseCase(dto: CreateUsersDto): Promise<void>;

  toggleUserIsActive(id: string): Promise<void>;
}
