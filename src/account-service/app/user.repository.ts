import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../domain/data-access/entities/user.entity';
import { UserStatus } from '../domain/constants/user-constant';
import { Page, PageRequest } from '../../system/query-shape/dto';
import { GetUsersQueryRequest } from '../domain/presentation/dto/get-users-query.request';
import { UserOverviewAggregate } from '../domain/data-access/aggregates/user-overview.aggregate';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(
    @InjectRepository(User)
    repository: Repository<User>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  async findPaginatedOverviewUsers(
    query: GetUsersQueryRequest,
  ): Promise<Page<UserOverviewAggregate>> {
    const {
      joinedIn,
      userStatus,
      search = '',
      departmentIds,
      periodIds,
    } = query;
    const { offset, size } = PageRequest.of(query);

    const qb = this.createQueryBuilder('users')
      .select([
        'users.id',
        'users.username',
        'users.fullName',
        'users.email',
        'users.createdAt',
        'users.joinedAt',
        'users.deletedAt',
      ])
      .skip(offset)
      .take(size)
      .withDeleted()
      .leftJoinAndSelect('users.roles', 'roles')
      .leftJoinAndSelect('users.domain', 'domain')
      .leftJoinAndSelect('users.period', 'period')
      .leftJoinAndSelect('users.operationFee', 'operationFee')
      .leftJoinAndSelect('operationFee.monthlyConfig', 'monthlyConfig');

    if (joinedIn) {
      qb.andWhere('users.createdAt BETWEEN :from AND :to', {
        from: joinedIn.fromDate,
        to: joinedIn.toDate,
      });
    }

    if (search) {
      qb.andWhere('users.email LIKE :email', {
        email: `%${search}%`,
      });
    }

    if (userStatus) {
      if (userStatus.includes(UserStatus.DEBTOR)) {
        qb.andWhere(
          `operationFee.paidMonths < EXTRACT(MONTH FROM age(CURRENT_DATE, users.joinedAt))`,
        );
      }

      if (userStatus.includes(UserStatus.INACTIVE)) {
        qb.andWhere(`users.deletedAt IS NOT NULL`);
      }
    }

    if (departmentIds?.length) {
      qb.andWhere('domain.id IN (:...departmentIds)', {
        departmentIds,
      });
    }

    if (periodIds?.length) {
      qb.andWhere('period.id IN (:...periodIds)', {
        periodIds,
      });
    }

    const [data, totalRecords] = await qb.getManyAndCount();

    return Page.of({
      query,
      items: data as UserOverviewAggregate[],
      totalRecords,
    });
  }
}
