import { OffsetPagination } from '../../../../system/query-shape/dto';
import { IsOptional } from 'class-validator';
import { ToManyString } from '../../../../system/query-shape/decorators/transformer';

export class FindRequestedActivityRequestDTO extends OffsetPagination {
  query: string;

  @IsOptional()
  @ToManyString()
  departmentIds?: number[];

  @IsOptional()
  fromDate?: string;

  @IsOptional()
  toDate?: string;

  @IsOptional()
  @ToManyString()
  status?: string[];

  @IsOptional()
  @ToManyString()
  requestTypes?: string[];
}
