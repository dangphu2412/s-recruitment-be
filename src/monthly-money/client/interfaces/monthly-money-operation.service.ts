import { createInterfaceToken } from '../../../system/utils';
import { CreateMoneyFee } from '../types/create-money-fee.types';
import { UpdatePaid } from '../types/update-paid.types';
import { OperationFee } from '../entities/operation-fee.entity';
import { DebtOperationFeeQuery } from '../types/query.types';

export const MonthlyMoneyOperationServiceToken = createInterfaceToken(
  'MonthlyMoneyOperationService',
);

export interface MonthlyMoneyOperationService {
  createOperationFee(createMoneyFee: CreateMoneyFee): Promise<void>;
  updateNewPaid(updatePaid: UpdatePaid): Promise<void>;
  findDebtOperationFee(query: DebtOperationFeeQuery): Promise<OperationFee[]>;
}
