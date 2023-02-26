import { EntityRepository, Repository } from 'typeorm';
import { DebtorManagementQuery, User, UserManagementQuery } from '../client';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  findUsersForManagement({
    offset,
    size,
    joinedIn,
    search = '',
  }: UserManagementQuery) {
    return this.createQueryBuilder('users')
      .select()
      .skip(offset)
      .take(size)
      .withDeleted()
      .leftJoinAndSelect('users.roles', 'roles')
      .leftJoinAndSelect('users.operationFee', 'operationFee')
      .leftJoinAndSelect('operationFee.monthlyConfig', 'monthlyConfig')
      .andWhere('users.createdAt BETWEEN :from AND :to', {
        from: joinedIn.fromDate,
        to: joinedIn.toDate,
      })
      .andWhere('users.email LIKE :email', {
        email: `%${search}%`,
      })
      .getManyAndCount();
  }

  findDebtorForManagement({
    joinedIn,
    search = '',
    userIds,
  }: DebtorManagementQuery) {
    return this.createQueryBuilder('users')
      .select()
      .withDeleted()
      .leftJoinAndSelect('users.roles', 'roles')
      .leftJoinAndSelect('users.operationFee', 'operationFee')
      .leftJoinAndSelect('operationFee.monthlyConfig', 'monthlyConfig')
      .andWhere('users.createdAt BETWEEN :from AND :to', {
        from: joinedIn.fromDate,
        to: joinedIn.toDate,
      })
      .andWhere('users.email LIKE :email', {
        email: `%${search}%`,
      })
      .andWhere(`users.id IN (:...userIds)`, { userIds })
      .getManyAndCount();
  }

  insertIgnoreDuplicated(users: User[]) {
    return this.createQueryBuilder()
      .insert()
      .values(users)
      .orIgnore()
      .execute();
  }
}
