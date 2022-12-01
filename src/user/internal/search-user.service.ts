import map from 'lodash/map';
import {
  SearchUserService,
  UserManagementQuery,
  UserManagementView,
} from '../client';
import { UserRepository } from './user.repository';
import { createPage } from '@shared/query-shape/pagination/factories';
import { Inject, Injectable } from '@nestjs/common';
import { Page } from '@shared/query-shape/pagination/types';
import { MemberType } from '../client/constants';
import {
  MonthlyMoneyOperationService,
  MonthlyMoneyOperationServiceToken,
} from '../../monthly-money';

@Injectable()
export class SearchUserServiceImpl implements SearchUserService {
  constructor(
    private readonly userRepository: UserRepository,
    @Inject(MonthlyMoneyOperationServiceToken)
    private readonly operationFeeService: MonthlyMoneyOperationService,
  ) {}

  async search(query: UserManagementQuery): Promise<Page<UserManagementView>> {
    const { page, size, search, joinedIn, memberType } = query;
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
      searchQueryBuilder.andWhere('users.createdAt BETWEEN :from AND :to', {
        from: joinedIn.fromDate,
        to: joinedIn.toDate,
      });
    }

    if (search) {
      searchQueryBuilder.andWhere('users.email LIKE :email', {
        email: `%${search}%`,
      });
    }

    if (memberType === MemberType.DEBTOR) {
      const memberOperationFees =
        await this.operationFeeService.findDebtOperationFee({
          size,
          offset,
        });

      const userIds = map(memberOperationFees, 'userId');

      searchQueryBuilder.andWhere(`users.id IN (:...userIds)`, { userIds });
      searchQueryBuilder.skip(undefined);
      searchQueryBuilder.take(undefined);
    }

    const [items, totalRecords] = await searchQueryBuilder.getManyAndCount();

    return createPage({
      query,
      totalRecords,
      items,
    });
  }
}
