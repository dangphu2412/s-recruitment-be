import {
  CreateMoneyFee,
  MonthlyMoneyOperationService,
  OperationFee,
} from '../client';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

export class MonthlyMoneyOperationServiceImpl
  implements MonthlyMoneyOperationService
{
  constructor(
    @InjectRepository(OperationFee)
    private readonly operationFeeRepository: Repository<OperationFee>,
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
}
