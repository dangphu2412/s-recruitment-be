import { Role } from '../../authorization';
import { Injectable, Logger } from '@nestjs/common';
import { UserRepository } from './user.repository';
import {
  CreateUserDto,
  DuplicatedUsernameException,
  NotFoundUserException,
  User,
  UserManagementQuery,
  UserManagementView,
  UserService,
} from '../client';
import { MyProfile } from '../../authentication';
import { InsertResult } from 'typeorm';
import { InsertUserFailedException } from '../client/exceptions/insert-user-failed.exception';

@Injectable()
export class UserServiceImpl implements UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async assertUsernameNotDuplicated(username: string): Promise<void> {
    const isUsernameExisted =
      (await this.userRepository.count({
        where: {
          username,
        },
      })) > 0;

    if (isUsernameExisted) {
      throw new DuplicatedUsernameException();
    }
  }

  async findMyProfile(id: string): Promise<MyProfile | null> {
    return this.userRepository.findOne(id, {
      select: ['id', 'username'],
    });
  }

  find(query: UserManagementQuery): Promise<UserManagementView> {
    const offset = (query.page - 1) * query.size;

    return this.userRepository.find({
      skip: offset,
      take: query.size,
      withDeleted: true,
    });
  }

  findByUsername(username: string): Promise<User>;
  findByUsername(username: string, relations: string[]): Promise<User>;
  findByUsername(username: string, relations?: string[]): Promise<User> {
    return this.userRepository.findOne({
      where: {
        username,
      },
      relations,
    });
  }

  async create(dto: CreateUserDto): Promise<InsertResult> {
    const newUser = new User();

    newUser.username = dto.email;
    newUser.email = dto.email;
    newUser.password = '';
    newUser.birthday = new Date(dto.birthday);
    newUser.joinedAt = null;

    try {
      return await this.userRepository.insert(newUser);
    } catch (error) {
      Logger.error(error.message, error.stack, UserServiceImpl.name);
      throw new InsertUserFailedException();
    }
  }

  async updateRolesForUser(user: User, roles: Role[]) {
    user.roles = roles;
    await this.userRepository.save(user, { reload: false });
  }

  async toggleUserIsActive(id: string): Promise<void> {
    const user = await this.userRepository.findOne(id, {
      withDeleted: true,
    });

    if (!user) {
      throw new NotFoundUserException();
    }

    if (user.deletedAt === null) {
      await this.userRepository.softDelete(id);
      return;
    }

    await this.userRepository.restore(id);
  }

  findById(id: string): Promise<User | null>;
  findById(id: string, relations?: string[]): Promise<User | null>;
  findById(id: string, relations?: string[]): Promise<User | null> {
    return this.userRepository.findOne(id, {
      relations,
    });
  }
}
