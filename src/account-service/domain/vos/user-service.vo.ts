import { User } from '../entities/user.entity';

export type CreateUserPayload = {
  email: string;
  fullName: string;
  birthday?: string;
};

export type UpdateUserRole = {
  roleIds?: number[];
};

export type UserQuery = Partial<User> & {
  withRights?: boolean;
  withRoles?: boolean;
  withDeleted?: boolean;
};
