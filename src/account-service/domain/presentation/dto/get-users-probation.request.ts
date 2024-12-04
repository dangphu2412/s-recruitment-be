import { IsNotEmpty, IsOptional } from 'class-validator';
import { OffsetPagination } from '../../../../system/query-shape/dto';

export class UserProbationRequest extends OffsetPagination {
  @IsNotEmpty()
  periodId: string;

  @IsOptional()
  departmentId?: string;
}
