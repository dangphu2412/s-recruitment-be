import {
  SearchUserService,
  User,
  UserManagementQuery,
  UserManagementView,
} from '../client';
import { UserRepository } from './user.repository';
import { createPage } from '@shared/query-shape/pagination/factories';
import { Injectable } from '@nestjs/common';
import { differenceInMonths } from 'date-fns';
import { Page } from '@shared/query-shape/pagination/types';
import { PaidStatus } from '../client/constants';

@Injectable()
export class SearchUserServiceImpl implements SearchUserService {
  constructor(private readonly userRepository: UserRepository) {}

  async search(query: UserManagementQuery): Promise<Page<UserManagementView>> {
    const { page, size, search, joinedIn } = query;
    const offset = (page - 1) * size;

    const searchQueryBuilder = this.userRepository
      .createQueryBuilder('users')
      .select()
      .skip(offset)
      .take(size)
      .withDeleted()
      .leftJoinAndSelect('users.roles', 'roles')
      .leftJoinAndSelect('users.operationFee', 'operationFee')
      .leftJoinAndSelect('operationFee.monthlyConfig', 'monthlyConfig')
      .andWhere('users_roles.id IS NULL');

    if (joinedIn) {
      searchQueryBuilder.andWhere('users.joinedAt BETWEEN :from AND :to', {
        from: joinedIn.fromDate,
        to: joinedIn.toDate,
      });
    }

    if (search) {
      searchQueryBuilder.andWhere('users.email LIKE :email', {
        email: `%${search}%`,
      });
    }

    const [items, totalRecords] = await searchQueryBuilder.getManyAndCount();

    const results = items.map(this.mapPayment);

    return createPage({
      query,
      totalRecords,
      items: results,
    });
  }

  private mapPayment = (user: User): UserManagementView => {
    const { operationFee } = user;

    if (!operationFee) {
      return {
        ...user,
        paidMonths: null,
        paidStatus: null,
        estimatedPaidMonths: null,
      };
    }

    const paidMonths = Math.ceil(
      operationFee.paidMoney / operationFee.monthlyConfig.amount,
    );
    const estimatedMonths = differenceInMonths(new Date(), user.joinedAt);
    const debtMonths = estimatedMonths - paidMonths;

    return {
      ...user,
      paidMonths,
      paidStatus: debtMonths > 0 ? PaidStatus.LATE : PaidStatus.EARLY,
      estimatedPaidMonths: estimatedMonths,
    };
  };
}
