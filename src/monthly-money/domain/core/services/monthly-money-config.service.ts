import { createInterfaceToken } from '../../../../system/utils';
import { MonthlyMoneyConfig } from '../../data-access/entities/monthly-money-config.entity';

export const MonthlyMoneyConfigServiceToken = createInterfaceToken(
  'MonthlyMoneyConfigService',
);

export interface MonthlyMoneyConfigService {
  findAll(): Promise<MonthlyMoneyConfig[]>;

  /**
   * @throws {NoMonthlyMoneyConfigFoundException}
   */
  findById(id: number): Promise<MonthlyMoneyConfig>;
}
