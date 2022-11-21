import { createInterfaceToken } from '../../../utils';
import { CreateMoneyFee } from '../types/create-money-fee.types';
import { UpdatePaid } from '../types/update-paid.types';

export const MonthlyMoneyOperationServiceToken = createInterfaceToken(
  'MonthlyMoneyOperationService',
);

export interface MonthlyMoneyOperationService {
  createOperationFee(createMoneyFee: CreateMoneyFee): Promise<void>;
  updateNewPaid(updatePaid: UpdatePaid): Promise<void>;
}
