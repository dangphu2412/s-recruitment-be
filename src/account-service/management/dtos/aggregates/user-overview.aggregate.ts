import { User } from '../../../shared/entities/user.entity';

export type UserOverviewAggregate = RequiredWith<
  User,
  'department' | 'period' | 'roles'
>;
