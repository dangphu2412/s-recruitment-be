import { createInterfaceToken } from '../../../../system/utils';
import { CreateMoneyFeeDTO } from '../dto/create-money-fee.dto';
import { OperationFee } from '../../data-access/entities/operation-fee.entity';

export const MonthlyMoneyOperationServiceToken = createInterfaceToken(
  'MonthlyMoneyOperationService',
);

export interface MonthlyMoneyOperationService {
  createOperationFee(createMoneyFee: CreateMoneyFeeDTO): Promise<void>;
  findOperationByUserId(userId: string): Promise<OperationFee>;
}
