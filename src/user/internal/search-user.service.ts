import {
  UserManagementQuery,
  UserManagementView,
  SearchUserService,
} from '../client';
import { UserRepository } from './user.repository';
import { createPage } from '../../shared/query-shape/pagination/factories/page.factory';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SearchUserServiceImpl implements SearchUserService {
  constructor(private readonly userRepository: UserRepository) {}

  async search(query: UserManagementQuery): Promise<UserManagementView> {
    const { page, size, search } = query;
    const offset = (page - 1) * size;

    const searchQueryBuilder = this.userRepository
      .createQueryBuilder('users')
      .select()
      .skip(offset)
      .take(size)
      .withDeleted()
      .leftJoinAndSelect('users.operationFee', 'operationFee')
      .leftJoinAndSelect('operationFee.monthlyConfig', 'monthlyConfig');

    if (query.search) {
      searchQueryBuilder.andWhere('users.email LIKE :email', {
        email: `%${search}%`,
      });
    }

    const [items, totalRecords] = await searchQueryBuilder.getManyAndCount();

    return createPage({
      query,
      totalRecords,
      items,
    });
  }
}
