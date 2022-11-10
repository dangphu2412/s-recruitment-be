import { User } from '../entities/user.entity';
import { UserManagementQuery } from '../dtos/user-management-query.dto';
import { Role } from '../../../authorization';
import { MyProfile } from '../../../authentication';
import { CreateUserDto } from '../dtos/create-user.dto';
import { InsertResult } from 'typeorm';
import { createInterfaceToken } from '../../../utils';
import { TurnToMembersDto } from '../dtos/turn-to-members.dto';

export const UserServiceToken = createInterfaceToken('UserService');

export interface UserService {
  find(query: UserManagementQuery): Promise<User[]>;

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
  create(dto: CreateUserDto): Promise<InsertResult>;
  create(dto: CreateUserDto[]): Promise<InsertResult>;
  create(dto: CreateUserDto | CreateUserDto[]): Promise<InsertResult>;

  updateRolesForUser(user: User, roles: Role[]): Promise<void>;
  toggleUserIsActive(id: string): Promise<void>;

  turnToMembers(turnToMembersDto: TurnToMembersDto): Promise<void>;
}
