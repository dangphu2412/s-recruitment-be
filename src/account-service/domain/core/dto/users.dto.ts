import { UserManagementQueryDto } from '../../dtos/user-management-query.dto';
import { PageRequest } from 'src/system/query-shape/types';

export type UserManagementViewDTO = {
  id: string;
  username: string;
  email: string;
  fullName: string;
  createdAt: Date;
  deletedAt: Date;
  joinedAt: Date;
  roles: {
    id: string;
    name: string;
  }[];
  paidMonths: number;
  remainMonths: number;
  estimatedPaidMonths: number;
  debtMonths: number;
  isProbation: boolean;
  domain: {
    id: number;
    name: string;
  };
  period: {
    id: number;
    name: string;
  };
};

export type UserManagementQuery = Required<UserManagementQueryDto> &
  PageRequest;
