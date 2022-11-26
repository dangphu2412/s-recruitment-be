import { User } from '../entities/user.entity';
import { PaidStatus } from '../constants';

export type UserManagementView = Omit<User, 'password' | 'roles'> & {
  paidMonths: number;
  estimatedPaidMonths: number;
  paidStatus: PaidStatus;
};
