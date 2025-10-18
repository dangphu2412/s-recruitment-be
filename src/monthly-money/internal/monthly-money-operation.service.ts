import { MonthlyMoneyOperationRepository } from './monthly-money-operation.repository';
import { Inject, Injectable } from '@nestjs/common';
import {
  MonthlyMoneyConfigService,
  MonthlyMoneyConfigServiceToken,
} from '../domain/core/services/monthly-money-config.service';
import { MonthlyMoneyOperationService } from '../domain/core/services/monthly-money-operation.service';
import { OperationFee } from '../../system/database/entities/operation-fee.entity';
import { CreateMoneyFeeDTO } from '../domain/core/dto/create-money-fee.dto';

@Injectable()
export class MonthlyMoneyOperationServiceImpl
  implements MonthlyMoneyOperationService
{
  constructor(
    private readonly operationFeeRepository: MonthlyMoneyOperationRepository,
    @Inject(MonthlyMoneyConfigServiceToken)
    private readonly moneyConfigService: MonthlyMoneyConfigService,
  ) {}

  findOperationFeeWithMoneyConfigById(id: string): Promise<OperationFee> {
    return this.operationFeeRepository.findOne({
      where: { id },
      relations: ['monthlyConfig'],
    });
  }

  async createOperationFee(dto: CreateMoneyFeeDTO): Promise<void> {
    const { monthlyConfigId, userIds } = dto;
    const config = await this.moneyConfigService.findById(monthlyConfigId);

    const items = userIds.map((userId) => {
      const entity = new OperationFee();
      entity.id = userId;
      entity.monthlyConfigId = monthlyConfigId;
      entity.remainMonths = config.monthRange;
      entity.paidMoney = 0;
      entity.paidMonths = 0;

      return entity;
    });

    await this.operationFeeRepository.save(items, { reload: false });
  }
}
