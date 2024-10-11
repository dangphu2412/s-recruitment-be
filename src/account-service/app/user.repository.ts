import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../domain/entities/user.entity';
import { UserManagementQuery } from '../domain/vos/user-management-view.vo';

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
      .select([
        'users.id',
        'users.username',
        'users.email',
        'users.createdAt',
        'users.deletedAt',
      ])
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

    if (search) {
      qb.andWhere('users.email LIKE :email', {
        email: `%${search}%`,
      });
    }

    return qb.getManyAndCount();
  }

  insertIgnoreDuplicated(users: User[]) {
    return (
      this.createQueryBuilder()
        .insert()
        .values(users)
        .orUpdate({
          conflict_target: ['email'],
          overwrite: ['username'],
        })
        // .orIgnore()
        .execute()
    );
  }
}
