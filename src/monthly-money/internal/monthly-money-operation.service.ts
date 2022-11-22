import {
  CreateMoneyFee,
  MonthlyMoneyOperationService,
  OperationFee,
} from '../client';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdatePaid } from '../client/types/update-paid.types';
import { NoOperationFeeFound } from '../../authorization';
import { ExceedLimitOperationUpdateException } from '../client';

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

  async updateNewPaid(updatePaid: UpdatePaid): Promise<void> {
    const { userId, newPaid } = updatePaid;

    await this.validateUpdateUserOperationFee(updatePaid);

    await this.operationFeeRepository.update(
      {
        userId,
      },
      {
        paidMoney: newPaid,
      },
    );
  }

  private async validateUpdateUserOperationFee({
    operationFeeId,
    userId,
    newPaid,
  }: UpdatePaid): Promise<void> {
    const operationFee = await this.operationFeeRepository.findOne({
      where: {
        id: operationFeeId,
        userId,
      },
      relations: ['monthlyConfig'],
    });

    if (!operationFee) {
      throw new NoOperationFeeFound();
    }

    const maxPaidMoney =
      operationFee.monthlyConfig.amount * operationFee.monthlyConfig.monthRange;

    if (maxPaidMoney < newPaid) {
      throw new ExceedLimitOperationUpdateException(
        'Exceed the max limit when update user monthly money',
      );
    }

    if (newPaid < 0) {
      throw new ExceedLimitOperationUpdateException(
        'Exceed the min limit when update user monthly money',
      );
    }
  }
}
