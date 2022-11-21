import {
  CreateMoneyFee,
  MonthlyMoneyOperationService,
  OperationFee,
} from '../client';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdatePaid } from '../client/types/update-paid.types';
import { NotMemberForbiddenException } from '../../authorization';
import { ExceedLimitOperationUpdateException } from '../client/exceptions/exceed-limit-operation-update.exception';

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

  async updateNewPaid({
    userId,
    newPaid,
    operationFeeId,
  }: UpdatePaid): Promise<void> {
    const operationFee = await this.operationFeeRepository.findOne({
      where: {
        id: operationFeeId,
        userId,
      },
      relations: ['monthlyConfig'],
    });

    if (!operationFee) {
      throw new NotMemberForbiddenException();
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

    await this.operationFeeRepository.update(
      {
        userId,
      },
      {
        paidMoney: newPaid,
      },
    );
  }
}
