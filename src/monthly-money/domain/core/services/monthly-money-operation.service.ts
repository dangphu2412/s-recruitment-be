import { createInterfaceToken } from '../../../../system/utils';
import {
  CreateMoneyFeeDTO,
  CreateMoneyFeeResultsDTO,
} from '../dto/create-money-fee.dto';
import { OperationFee } from '../../data-access/entities/operation-fee.entity';

export const MonthlyMoneyOperationServiceToken = createInterfaceToken(
  'MonthlyMoneyOperationService',
);

export interface MonthlyMoneyOperationService {
  createOperationFee(
    createMoneyFeeDTO: CreateMoneyFeeDTO,
  ): Promise<CreateMoneyFeeResultsDTO>;
  findOperationFeeWithMoneyConfigById(id: number): Promise<OperationFee>;
}
