import { IsNotEmpty, IsOptional } from 'class-validator';
import { OffsetPaginationRequest } from '../../../../system/pagination/offset-pagination-request';

export class UserProbationRequest extends OffsetPaginationRequest {
  @IsNotEmpty()
  periodId: string;

  @IsOptional()
  departmentId?: string;
}
