import { createProviderToken } from '../../../../system/nestjs-extensions';
import { CreateMoneyFeeDTO } from '../dto/create-money-fee.dto';
import { OperationFee } from '../../../../system/database/entities/operation-fee.entity';

export const MonthlyMoneyOperationServiceToken = createProviderToken(
  'MonthlyMoneyOperationService',
);

export interface MonthlyMoneyOperationService {
  createOperationFee(createMoneyFeeDTO: CreateMoneyFeeDTO): Promise<void>;
  findOperationFeeWithMoneyConfigById(id: string): Promise<OperationFee>;
}
