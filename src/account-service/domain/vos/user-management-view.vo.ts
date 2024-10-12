import { UserManagementQueryDto } from '../dtos/user-management-query.dto';
import { PageRequest } from 'src/system/query-shape/types';

export type UserManagementView = {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
  deletedAt: Date;
  roles: {
    id: string;
    name: string;
  }[];
  paidMonths: number;
  remainMonths: number;
  estimatedPaidMonths: number;
  isProbation: boolean;
};

export type UserManagementQuery = Required<UserManagementQueryDto> &
  PageRequest;
