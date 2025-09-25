import { OffsetPaginationRequest } from '../../../../system/pagination/offset-pagination-request';
import { IsOptional } from 'class-validator';
import { DeserializeQueryToArray } from '../../../../system/query-params/query-param-deserializer.decorator';

export class FindRequestedActivityRequestDTO extends OffsetPaginationRequest {
  query: string;

  @IsOptional()
  @DeserializeQueryToArray()
  departmentIds?: number[];

  @IsOptional()
  fromDate?: string;

  @IsOptional()
  toDate?: string;

  @IsOptional()
  @DeserializeQueryToArray()
  status?: string[];

  @IsOptional()
  @DeserializeQueryToArray()
  requestTypes?: string[];
}
