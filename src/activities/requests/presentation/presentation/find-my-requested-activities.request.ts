import { IsOptional } from 'class-validator';
import { DeserializeQueryToArray } from '../../../../system/query-params/query-param-deserializer.decorator';

export class FindMyRequestedActivitiesRequest {
  @IsOptional()
  @DeserializeQueryToArray()
  status?: string[];
}
