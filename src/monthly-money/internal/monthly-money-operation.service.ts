import {
  CreateMoneyFee,
  MonthlyMoneyConfigService,
  MonthlyMoneyConfigServiceToken,
  MonthlyMoneyOperationService,
  OperationFee,
} from '../client';
import { MonthlyMoneyOperationRepository } from './monthly-money-operation.repository';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class MonthlyMoneyOperationServiceImpl
  implements MonthlyMoneyOperationService
{
  constructor(
    private readonly operationFeeRepository: MonthlyMoneyOperationRepository,
    @Inject(MonthlyMoneyConfigServiceToken)
    private readonly moneyConfigService: MonthlyMoneyConfigService,
  ) {}

  async createOperationFee(createMoneyFee: CreateMoneyFee): Promise<void> {
    const config = await this.moneyConfigService.findById(
      createMoneyFee.monthlyConfigId,
    );
    const newOperationFees = createMoneyFee.userIds.map((userId) => {
      return {
        monthlyConfigId: createMoneyFee.monthlyConfigId,
        userId: userId,
        remainMonths: config.monthRange,
        paidMoney: 0,
        paidMonths: 0,
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
