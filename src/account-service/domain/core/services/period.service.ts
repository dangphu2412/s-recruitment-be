import { Period } from '../../data-access/entities/period.entity';
import { createInterfaceToken } from '../../../../system/utils';

export const PeriodServiceToken = createInterfaceToken('PeriodService');

export interface PeriodService {
  findPeriods(): Promise<Period[]>;
}
