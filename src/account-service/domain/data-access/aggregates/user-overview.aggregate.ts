import { User } from '../entities/user.entity';

export type UserOverviewAggregate = RequiredWith<
  User,
  'domain' | 'period' | 'roles'
>;
