import { createProviderToken } from '../../../../system/nestjs-extensions';
import { MonthlyMoneyConfig } from '../../../../system/database/entities/monthly-money-config.entity';

export const MonthlyMoneyConfigServiceToken = createProviderToken(
  'MonthlyMoneyConfigService',
);

export interface MonthlyMoneyConfigService {
  findAll(): Promise<MonthlyMoneyConfig[]>;
  findById(id: number): Promise<MonthlyMoneyConfig>;
}
