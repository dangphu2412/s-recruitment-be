import { createProviderToken } from '../../../../system/nestjs-extensions';
import { MonthlyMoneyConfig } from '../../data-access/entities/monthly-money-config.entity';

export const MonthlyMoneyConfigServiceToken = createProviderToken(
  'MonthlyMoneyConfigService',
);

export interface MonthlyMoneyConfigService {
  findAll(): Promise<MonthlyMoneyConfig[]>;

  /**
   * @throws {NoMonthlyMoneyConfigFoundException}
   */
  findById(id: number): Promise<MonthlyMoneyConfig>;
}
