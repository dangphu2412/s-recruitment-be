import { Role } from '../../../shared/entities/role.entity';

export type AccessControlList = Required<
  Role & {
    totalUsers: number;
  }
>[];
