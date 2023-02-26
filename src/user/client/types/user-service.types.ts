import { User } from '../entities/user.entity';

export type CreateUserPayload = {
  email: string;
  fullName: string;
  birthday?: string;
};

export type UpdatableUserPayload = {
  roleIds?: number[];
};

export type ExcelUserCreationPayload = {
  STT: string;
  'Họ và Tên:': string;
  'Chuyên môn:': string;
  Email: string;
  'Ngày sinh': number;
  Tháng: number;
  SĐT: number;
};

export type UserQuery = Partial<User> & {
  withRights?: boolean;
  withRoles?: boolean;
  withDeleted?: boolean;
};
