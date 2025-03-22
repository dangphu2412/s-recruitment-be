import { User } from '../../../domain/data-access/entities/user.entity';

export type UserOverviewAggregate = RequiredWith<
  User,
  'department' | 'period' | 'roles'
>;
