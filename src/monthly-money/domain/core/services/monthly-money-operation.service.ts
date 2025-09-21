import { createProviderToken } from '../../../../system/nestjs-extensions';
import {
  CreateMoneyFeeDTO,
  CreateMoneyFeeResultsDTO,
} from '../dto/create-money-fee.dto';
import { OperationFee } from '../../../../system/database/entities/operation-fee.entity';

export const MonthlyMoneyOperationServiceToken = createProviderToken(
  'MonthlyMoneyOperationService',
);

export interface MonthlyMoneyOperationService {
  createOperationFee(
    createMoneyFeeDTO: CreateMoneyFeeDTO,
  ): Promise<CreateMoneyFeeResultsDTO>;
  findOperationFeeWithMoneyConfigById(id: number): Promise<OperationFee>;
}
