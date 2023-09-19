import { Injectable } from '@nestjs/common';
import uniq from 'lodash/uniq';
import { User, UserQuery, UserService } from '../client';
import { UserRepository } from './user.repository';
import { In } from 'typeorm';

@Injectable()
export class UserServiceImpl implements UserService {
  constructor(private readonly userRepository: UserRepository) {}

  find(query: UserQuery | string[]): Promise<User[]> {
    if (Array.isArray(query)) {
      return this.userRepository.findBy({
        id: In(query),
      });
    }

    const {
      withDeleted,
      withRoles = false,
      withRights = false,
      ...userFields
    } = query;

    const relations = [];

    withRoles && relations.push('roles');
    withRights && relations.push('roles', 'roles.permissions');

    return this.userRepository.find({
      where: {
        ...userFields,
      },
      relations: uniq(relations),
      withDeleted,
    });
  }

  async findOne(query: UserQuery): Promise<User> {
    const records = await this.find(query);

    if (!records.length) {
      return {} as User;
    }

    return records[0];
  }
}
