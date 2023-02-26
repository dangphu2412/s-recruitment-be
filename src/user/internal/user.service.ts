import { Injectable } from '@nestjs/common';
import uniq from 'lodash/uniq';
import { User, UserQuery, UserService } from '../client';
import { UserRepository } from './user.repository';

@Injectable()
export class UserServiceImpl implements UserService {
  constructor(private readonly userRepository: UserRepository) {}

  find({
    withDeleted,
    withRoles = false,
    withRights = false,
    ...userFields
  }: UserQuery): Promise<User[]> {
    const relations = [];

    withRoles && relations.push('roles');
    withRights && relations.push('roles', 'roles.permissions');

    return this.userRepository.find({
      ...userFields,
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
