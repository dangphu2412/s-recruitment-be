import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OffsetPagination } from 'src/system/query-shape/dto/offset-pagination.request';
import { UserStatus } from '../../user-status.constant';
import { ToManyString } from '../../../../system/query-shape/decorators/transformer';

export class GetUsersQueryRequest extends OffsetPagination {
  @IsOptional()
  @IsString()
  search: string;

  @IsOptional()
  @IsEnum(UserStatus, { each: true })
  @ToManyString()
  userStatus?: UserStatus[];

  @IsOptional()
  @ToManyString()
  departmentIds?: number[];

  @IsOptional()
  @ToManyString()
  periodIds?: number[];

  @IsOptional()
  @ToManyString()
  roleIds?: number[];
}

export type UserManagementViewDTO = {
  id: string;
  username: string;
  email: string;
  fullName: string;
  createdAt: Date;
  deletedAt: Date;
  joinedAt: Date;
  roles: {
    id: number;
    name: string;
  }[];
  paidMonths: number;
  remainMonths: number;
  estimatedPaidMonths: number;
  debtMonths: number;
  isProbation: boolean;
  department: {
    id: string;
    name: string;
  };
  period: {
    id: string;
    name: string;
  };
};
