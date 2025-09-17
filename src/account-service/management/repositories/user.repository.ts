import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../shared/entities/user.entity';
import { UserStatus } from '../user-status.constant';
import { OffsetPaginationResponse } from '../../../system/pagination';
import { GetUsersQueryRequest } from '../dtos/presentations/get-users-query.request';
import { OffsetPaginationRequest } from '../../../system/pagination/offset-pagination-request';
import { ReminderUserDTO } from '../dtos/core/reminder-user.dto';
import { format } from 'date-fns';

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
  ): Promise<OffsetPaginationResponse<User>> {
    const {
      userStatus,
      search = '',
      departmentIds,
      periodIds,
      roleIds,
      size,
      birthday,
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

    if (birthday) {
      const formatted = format(new Date(birthday), 'yyyy-MM-dd');

      // TODO: Prent SQL Injection
      qb.andWhere(
        `EXTRACT(month FROM "users"."birthday") = EXTRACT(MONTH FROM DATE '${formatted}')`,
      );
    }

    const [data, totalRecords] = await qb.getManyAndCount();

    return OffsetPaginationResponse.of({
      query,
      items: data as User[],
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

  /**
   * Reminder users should be in the interval of 2 years since joined and still active
   */
  async findReminderUsers(): Promise<ReminderUserDTO[]> {
    const sql = `
      SELECT 
        "users"."id" AS "id",
        "users"."email" AS "email",
        "users"."joined_at" AS "joinedAt",
         LEAST(
           DATE_PART('year', AGE(NOW(), "users"."joined_at")) * 12 + DATE_PART('month', AGE(NOW(), "users"."joined_at")),
           "monthlyConfig".month_range
         ) - COALESCE("operationFee"."paid_months", 0) AS "debtMonths"
      FROM "users" "users"
         LEFT JOIN "operation_fees" "operationFee" ON "operationFee"."id"="users"."operation_fee_id"
         LEFT JOIN "monthly_money_configs" "monthlyConfig" ON "monthlyConfig"."id"="operationFee"."monthly_config_id"`;

    return this.manager.query<ReminderUserDTO[]>(sql, []);
  }
}
