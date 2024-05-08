import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../domain/entities/user.entity';
import {
  DebtorManagementQuery,
  UserManagementQuery,
} from '../domain/vos/user-management-view.vo';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(
    @InjectRepository(User)
    repository: Repository<User>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  findUsersForManagement({
    offset,
    size,
    joinedIn,
    search = '',
  }: UserManagementQuery) {
    const qb = this.createQueryBuilder('users')
      .select()
      .skip(offset)
      .take(size)
      .withDeleted()
      .leftJoinAndSelect('users.roles', 'roles')
      .leftJoinAndSelect('users.operationFee', 'operationFee')
      .leftJoinAndSelect('operationFee.monthlyConfig', 'monthlyConfig');

    if (joinedIn) {
      qb.andWhere('users.createdAt BETWEEN :from AND :to', {
        from: joinedIn.fromDate,
        to: joinedIn.toDate,
      });
    }

    qb.andWhere('users.email LIKE :email', {
      email: `%${search}%`,
    });

    return qb.getManyAndCount();
  }

  findDebtorForManagement({
    joinedIn,
    search = '',
    userIds,
  }: DebtorManagementQuery) {
    const qb = this.createQueryBuilder('users')
      .select()
      .withDeleted()
      .leftJoinAndSelect('users.roles', 'roles')
      .leftJoinAndSelect('users.operationFee', 'operationFee')
      .leftJoinAndSelect('operationFee.monthlyConfig', 'monthlyConfig');

    if (joinedIn) {
      qb.andWhere('users.createdAt BETWEEN :from AND :to', {
        from: joinedIn.fromDate,
        to: joinedIn.toDate,
      });
    }

    qb.andWhere('users.email LIKE :email', {
      email: `%${search}%`,
    }).andWhere(`users.id IN (:...userIds)`, { userIds });

    return qb.getManyAndCount();
  }

  insertIgnoreDuplicated(users: User[]) {
    return this.createQueryBuilder()
      .insert()
      .values(users)
      .orIgnore()
      .execute();
  }
}
