import { OffsetPaginationRequest } from '../../../../system/pagination/offset-pagination-request';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { LogWorkStatus } from '../../log-work-status.enum';
import { DeserializeQueryToArray } from '../../../../system/query-params/query-param-deserializer.decorator';

export class FindLogsRequest extends OffsetPaginationRequest {
  @IsOptional()
  @DeserializeQueryToArray()
  @IsEnum(LogWorkStatus, { each: true })
  workStatus?: LogWorkStatus[];

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  @DeserializeQueryToArray()
  @IsOptional()
  authors?: string[];

  @IsOptional()
  @IsString()
  query?: string;
}
