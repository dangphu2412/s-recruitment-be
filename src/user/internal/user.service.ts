import { Role } from '../../authorization';
import { Injectable, Logger } from '@nestjs/common';
import { UserRepository } from './user.repository';
import {
  CreateUserDto,
  NotFoundUserException,
  User,
  UserManagementQuery,
  UserManagementView,
  UserService,
  InsertUserFailedException,
} from '../client';
import { MyProfile } from '../../authentication';
import { In, InsertResult } from 'typeorm';
import { EmailDuplicatedException } from '../client/exceptions/email-duplicated.exception';
import uniqBy from 'lodash/uniqBy';

@Injectable()
export class UserServiceImpl implements UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async assertEmails(emails: string[]): Promise<void> {
    const emailCount = await this.userRepository.count({
      where: In(emails),
    });

    if (emailCount !== emails.length) {
      throw new EmailDuplicatedException();
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

  async create(dto: CreateUserDto | CreateUserDto[]): Promise<InsertResult> {
    const newUsers = Array.isArray(dto)
      ? uniqBy(dto, 'email').map(this.toUser)
      : [this.toUser(dto)];

    try {
      return await this.userRepository.insert(newUsers);
    } catch (error) {
      Logger.error(error.message, error.stack, UserServiceImpl.name);
      throw new InsertUserFailedException();
    }
  }

  private toUser(dto: CreateUserDto): User {
    return this.userRepository.create({
      ...dto,
      birthday: new Date(dto.birthday),
      joinedAt: null,
    });
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
