import { MonthlyMoneyOperationRepository } from './monthly-money-operation.repository';
import { Inject, Injectable } from '@nestjs/common';
import {
  MonthlyMoneyConfigService,
  MonthlyMoneyConfigServiceToken,
} from '../domain/core/services/monthly-money-config.service';
import { MonthlyMoneyOperationService } from '../domain/core/services/monthly-money-operation.service';
import { OperationFee } from '../domain/data-access/entities/operation-fee.entity';
import {
  CreateMoneyFeeDTO,
  CreateMoneyFeeResultsDTO,
} from '../domain/core/dto/create-money-fee.dto';

@Injectable()
export class MonthlyMoneyOperationServiceImpl
  implements MonthlyMoneyOperationService
{
  constructor(
    private readonly operationFeeRepository: MonthlyMoneyOperationRepository,
    @Inject(MonthlyMoneyConfigServiceToken)
    private readonly moneyConfigService: MonthlyMoneyConfigService,
  ) {}

  findOperationFeeWithMoneyConfigById(id: number): Promise<OperationFee> {
    return this.operationFeeRepository.findOne({
      where: { id },
      relations: ['monthlyConfig'],
    });
  }

  async createOperationFee(
    dto: CreateMoneyFeeDTO,
  ): Promise<CreateMoneyFeeResultsDTO> {
    const { monthlyConfigId, userIds } = dto;
    const config = await this.moneyConfigService.findById(monthlyConfigId);

    const items = await Promise.all(
      userIds.map(async (userId) => {
        const entity = new OperationFee();
        entity.monthlyConfigId = monthlyConfigId;
        entity.remainMonths = config.monthRange;
        entity.paidMoney = 0;
        entity.paidMonths = 0;

        const { identifiers } =
          await this.operationFeeRepository.insert(entity);

        return {
          userId,
          operationFeeId: identifiers[0].id,
        };
      }),
    );

    return {
      items,
    };
  }
}
