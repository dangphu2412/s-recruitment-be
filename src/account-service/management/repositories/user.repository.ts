import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../shared/entities/user.entity';
import { UserStatus } from '../user-status.constant';
import { OffsetPaginationResponse } from '../../../system/pagination';
import { GetUsersQueryRequest } from '../dtos/presentations/get-users-query.request';
import { UserOverviewAggregate } from '../dtos/aggregates/user-overview.aggregate';
import { OffsetPaginationRequest } from '../../../system/pagination/offset-pagination-request';

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
  ): Promise<OffsetPaginationResponse<UserOverviewAggregate>> {
    const {
      userStatus,
      search = '',
      departmentIds,
      periodIds,
      roleIds,
      size,
    } = query;
    const offset = OffsetPaginationRequest.getOffset(query.page, query.size);

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
      .leftJoinAndSelect('users.department', 'department')
      .leftJoinAndSelect('users.period', 'period')
      .leftJoinAndSelect('users.operationFee', 'operationFee')
      .leftJoinAndSelect('operationFee.monthlyConfig', 'monthlyConfig');

    if (search) {
      qb.andWhere(
        '(users.email ILIKE :email OR users.fullName ILIKE :fullName)',
        {
          email: `%${search}%`,
          fullName: `%${search}%`,
        },
      );
    }

    if (userStatus) {
      if (userStatus.includes(UserStatus.DEBTOR)) {
        qb.andWhere(
          `operationFee.paidMonths < EXTRACT(MONTH FROM AGE(CURRENT_DATE, users.joinedAt))`,
        );
      }

      if (userStatus.includes(UserStatus.INACTIVE)) {
        qb.andWhere(`users.deletedAt IS NOT NULL`);
      }
    }

    if (departmentIds?.length) {
      qb.andWhere('department.id IN (:...departmentIds)', {
        departmentIds,
      });
    }

    if (periodIds?.length) {
      qb.andWhere('period.id IN (:...periodIds)', {
        periodIds,
      });
    }

    if (roleIds?.length) {
      qb.andWhere('roles.id IN (:...roleIds)', {
        roleIds,
      });
    }

    const [data, totalRecords] = await qb.getManyAndCount();

    return OffsetPaginationResponse.of({
      query,
      items: data as UserOverviewAggregate[],
      totalRecords,
    });
  }

  saveUsersIgnoreConflict(entities: User[]) {
    return this.createQueryBuilder('users')
      .insert()
      .values(entities)
      .orUpdate(['full_name', 'birthday', 'phone_number'], ['username'])
      .returning('')
      .execute();
  }
}
