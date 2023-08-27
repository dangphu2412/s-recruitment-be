import { FindManyOptions, Repository } from 'typeorm';
import { OperationFee } from '../client';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MonthlyMoneyOperationRepository extends Repository<OperationFee> {
  constructor(
    @InjectRepository(OperationFee)
    repository: Repository<OperationFee>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  private static ESTIMATED_MONTH_GREATER_THAN_CURRENT_PAID_QUERY = `EXTRACT(MONTH FROM age(now(), operationFees.joined_at)) > (operationFees.paid_money / monthlyConfigs.amount)`;

  findDebtOperationFee({
    skip,
    take,
  }: FindManyOptions): Promise<OperationFee[]> {
    return this.createQueryBuilder('operationFees')
      .leftJoinAndSelect('operationFees.monthlyConfig', 'monthlyConfigs')
      .andWhere(
        MonthlyMoneyOperationRepository.ESTIMATED_MONTH_GREATER_THAN_CURRENT_PAID_QUERY,
      )
      .limit(take)
      .offset(skip)
      .getMany();
  }
}
