import { IsNotEmpty, IsOptional } from 'class-validator';
import { OffsetPagination } from '../../../system/query-shape/dto';

export type UserProbationQueryInput = {
  domainId?: number;
  periodId: number;
} & OffsetPagination;

export class UserProbationQueryInputDto
  extends OffsetPagination
  implements UserProbationQueryInput
{
  @IsNotEmpty()
  periodId: number;

  @IsOptional()
  domainId?: number;
}
