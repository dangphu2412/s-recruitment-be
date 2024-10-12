import { IsNotEmpty, IsOptional } from 'class-validator';
import { OffsetPagination } from '../../../system/query-shape/dto';

export type UserProbationQueryInput = {
  domainId?: string;
  periodId: string;
} & OffsetPagination;

export class UserProbationQueryInputDto
  extends OffsetPagination
  implements UserProbationQueryInput
{
  @IsNotEmpty()
  periodId: string;

  @IsOptional()
  domainId?: string;
}
