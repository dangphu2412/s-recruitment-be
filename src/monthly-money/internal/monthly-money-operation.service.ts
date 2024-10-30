import { MonthlyMoneyOperationRepository } from './monthly-money-operation.repository';
import { Inject, Injectable } from '@nestjs/common';
import {
  MonthlyMoneyConfigService,
  MonthlyMoneyConfigServiceToken,
} from '../domain/core/services/monthly-money-config.service';
import { MonthlyMoneyOperationService } from '../domain/core/services/monthly-money-operation.service';
import { CreateMoneyFeeDTO } from '../domain/core/dto/create-money-fee.dto';
import { OperationFee } from '../domain/data-access/entities/operation-fee.entity';

@Injectable()
export class MonthlyMoneyOperationServiceImpl
  implements MonthlyMoneyOperationService
{
  constructor(
    private readonly operationFeeRepository: MonthlyMoneyOperationRepository,
    @Inject(MonthlyMoneyConfigServiceToken)
    private readonly moneyConfigService: MonthlyMoneyConfigService,
  ) {}

  async createOperationFee(createMoneyFee: CreateMoneyFeeDTO): Promise<void> {
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
