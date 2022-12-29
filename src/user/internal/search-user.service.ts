import map from 'lodash/map';
import {
  SearchUserService,
  UserManagementQuery,
  UserManagementQueryDto,
  UserManagementView,
} from '../client';
import { UserRepository } from './user.repository';
import { Inject, Injectable } from '@nestjs/common';
import { Page } from '@shared/query-shape/pagination/entities';
import { MemberType } from '../client/constants';
import {
  MonthlyMoneyOperationService,
  MonthlyMoneyOperationServiceToken,
} from '../../monthly-money';
import { PageRequest } from '@shared/query-shape/pagination/entities/page-request';

@Injectable()
export class SearchUserServiceImpl implements SearchUserService {
  constructor(
    private readonly userRepository: UserRepository,
    @Inject(MonthlyMoneyOperationServiceToken)
    private readonly operationFeeService: MonthlyMoneyOperationService,
  ) {}

  async search(
    query: UserManagementQueryDto,
  ): Promise<Page<UserManagementView>> {
    const { search, joinedIn, memberType } = query;
    const { offset, size } = PageRequest.of(query);

    if (memberType === MemberType.DEBTOR) {
      const memberOperationFees =
        await this.operationFeeService.findDebtOperationFee({
          size,
          offset,
        });

      const userIds = map(memberOperationFees, 'userId');

      if (!userIds.length) {
        return Page.of({
          query,
          totalRecords: 0,
          items: [],
        });
      }

      const [items, totalRecords] =
        await this.userRepository.findDebtorForManagement({
          joinedIn,
          userIds,
          search,
          memberType,
        });

      return Page.of({
        query,
        totalRecords,
        items,
      });
    }

    const [items, totalRecords] =
      await this.userRepository.findUsersForManagement({
        ...query,
        offset,
        size,
      } as UserManagementQuery);

    return Page.of({
      query,
      totalRecords,
      items,
    });
  }
}
