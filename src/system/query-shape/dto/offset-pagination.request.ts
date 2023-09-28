import { IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { OptionalToDefault } from '../decorators/optional-to-default';
import { ConfigKeys } from '../config.registry';

export class OffsetPagination {
  @Type(() => Number)
  @OptionalToDefault(ConfigKeys.DEFAULT_PAGE)
  @IsNumber()
  page: number;

  @Type(() => Number)
  @OptionalToDefault(ConfigKeys.DEFAULT_SIZE)
  @IsNumber()
  size: number;
}
