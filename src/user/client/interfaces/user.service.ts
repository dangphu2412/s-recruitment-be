import { User } from '../entities/user.entity';
import { UserManagementQuery } from '../dtos/user-management-query.dto';
import { Role } from '../../../authorization';
import { MyProfile } from '../../../authentication';
import { InsertResult } from 'typeorm';
import { createInterfaceToken } from '../../../utils';
import { CreateUsersDto } from '../dtos/create-users.dto';
import { CreateUserPayload } from '../types/user-service.types';

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
  create(dto: CreateUserPayload): Promise<InsertResult>;
  create(dto: CreateUserPayload[]): Promise<InsertResult>;

  updateRolesForUser(user: User, roles: Role[]): Promise<void>;
  toggleUserIsActive(id: string): Promise<void>;

  turnToMembers(turnToMembersDto: CreateUsersDto): Promise<void>;

  createUserUseCase(dto: CreateUsersDto): Promise<void>;
}
