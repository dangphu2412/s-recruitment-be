import { createInterfaceToken } from '../../../utils';
import { MonthlyMoneyConfig } from '../entities/monthly-money-config.entity';

export const MonthlyMoneyConfigServiceToken = createInterfaceToken(
  'MonthlyMoneyConfigService',
);

export interface MonthlyMoneyConfigService {
  find(): Promise<MonthlyMoneyConfig[]>;
}
