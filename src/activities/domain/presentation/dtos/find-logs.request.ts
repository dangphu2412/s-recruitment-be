import { OffsetPagination } from '../../../../system/query-shape/dto';
import { IsDateString, IsOptional } from 'class-validator';

export class FindLogsRequest extends OffsetPagination {
  @IsOptional()
  isLate?: boolean;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;
}
