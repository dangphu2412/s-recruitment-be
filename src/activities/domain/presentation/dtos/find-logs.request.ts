import { OffsetPagination } from '../../../../system/query-shape/dto';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { LogWorkStatus } from '../../core/constants/log-work-status.enum';
import { ToManyString } from '../../../../system/query-shape/decorators/transformer';

export class FindLogsRequest extends OffsetPagination {
  @IsOptional()
  @ToManyString()
  @IsEnum(LogWorkStatus, { each: true })
  workStatus?: LogWorkStatus[];

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;
}
