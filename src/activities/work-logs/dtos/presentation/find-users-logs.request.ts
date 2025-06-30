import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { DeserializeQueryToArray } from '../../../../system/query-params/query-param-deserializer.decorator';
import { LogWorkStatus } from '../../log-work-status.enum';

export class FindUsersLogsRequest {
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
