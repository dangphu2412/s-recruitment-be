import { User } from '../entities/user.entity';

export type UserOverviewAggregate = RequiredWith<
  User,
  'department' | 'period' | 'roles'
>;
