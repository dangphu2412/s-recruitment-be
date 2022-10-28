import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { User } from '../entities/user.entity';
import { UserManagementView } from '../types/user-management-view.types';
import { UserManagementQuery } from '../dtos/user-management-query.dto';
import { Role } from '../../../authorization';
import { MyProfile } from '../../../authentication';
import { CreateUserDto } from '../dtos/create-user.dto';
import { InsertResult } from 'typeorm';

export const UserServiceToken = randomStringGenerator();

export interface UserService {
  find(query: UserManagementQuery): Promise<UserManagementView>;

  findById(id: string): Promise<User | null>;
  findById(id: string, relations: string[]): Promise<User | null>;

  findByUsername(username: string): Promise<User>;
  findByUsername(username: string, relations: string[]): Promise<User>;

  /**
   * @throws {DuplicatedUsernameException}
   */
  assertUsernameNotDuplicated(username: string): Promise<void>;

  findMyProfile(id: string): Promise<MyProfile>;

  /**
   * @throws {InsertUserFailedException}
   */
  create(dto: CreateUserDto): Promise<InsertResult>;
  updateRolesForUser(user: User, roles: Role[]): Promise<void>;
  toggleUserIsActive(id: string): Promise<void>;
}
