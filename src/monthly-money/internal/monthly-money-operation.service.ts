import {
  CreateMoneyFee,
  MonthlyMoneyOperationService,
  OperationFee,
} from '../client';
import { MonthlyMoneyOperationRepository } from './monthly-money-operation.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MonthlyMoneyOperationServiceImpl
  implements MonthlyMoneyOperationService
{
  constructor(
    private readonly operationFeeRepository: MonthlyMoneyOperationRepository,
  ) {}

  async createOperationFee(createMoneyFee: CreateMoneyFee): Promise<void> {
    const newOperationFees = createMoneyFee.userIds.map((userId) => {
      return {
        monthlyConfigId: createMoneyFee.monthlyConfigId,
        userId: userId,
        paidMoney: 0,
      };
    });

    await this.operationFeeRepository.insert(newOperationFees);
  }

  findOperationByUserId(userId: string): Promise<OperationFee> {
    return this.operationFeeRepository.findOne({
      where: {
        userId,
      },
    });
  }
}
