import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OffsetPaginationRequest } from 'src/system/pagination/offset-pagination-request';
import { UserStatus } from '../../user-status.constant';
import { DeserializeQueryToArray } from '../../../../system/query-params/query-param-deserializer.decorator';

export class GetUsersQueryRequest extends OffsetPaginationRequest {
  @IsOptional()
  @IsString()
  search: string;

  @IsOptional()
  @IsEnum(UserStatus, { each: true })
  @DeserializeQueryToArray()
  userStatus?: UserStatus[];

  @IsOptional()
  @DeserializeQueryToArray()
  departmentIds?: number[];

  @IsOptional()
  @DeserializeQueryToArray()
  periodIds?: number[];

  @IsOptional()
  @DeserializeQueryToArray()
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
