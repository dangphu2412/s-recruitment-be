import { createInterfaceToken } from '../../../system/utils';
import { CreateMoneyFee } from '../types/create-money-fee.types';
import { OperationFee } from '../entities/operation-fee.entity';

export const MonthlyMoneyOperationServiceToken = createInterfaceToken(
  'MonthlyMoneyOperationService',
);

export interface MonthlyMoneyOperationService {
  createOperationFee(createMoneyFee: CreateMoneyFee): Promise<void>;
  findOperationByUserId(userId: string): Promise<OperationFee>;
}
