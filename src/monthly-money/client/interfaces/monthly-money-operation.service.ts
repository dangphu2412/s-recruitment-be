import { createInterfaceToken } from '../../../utils';
import { CreateMoneyFee } from '../types/create-money-fee.types';

export const MonthlyMoneyOperationServiceToken = createInterfaceToken(
  'MonthlyMoneyOperationService',
);

export interface MonthlyMoneyOperationService {
  createOperationFee(createMoneyFee: CreateMoneyFee): Promise<void>;
}
