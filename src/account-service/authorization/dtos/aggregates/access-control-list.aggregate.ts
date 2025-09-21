import { Role } from '../../../../system/database/entities/role.entity';

export type AccessControlList = Required<
  Role & {
    totalUsers: number;
  }
>[];
