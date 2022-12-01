import { IsNumber } from 'class-validator';
import { ToInt } from '@shared/transformer';
import { OptionalToDefault } from '../decorators/optional-to-default';
import { ConfigKeys } from '../../config.registry';

export class OffsetPagination {
  @ToInt()
  @OptionalToDefault(ConfigKeys.DEFAULT_PAGE)
  @IsNumber()
  page: number;

  @ToInt()
  @OptionalToDefault(ConfigKeys.DEFAULT_SIZE)
  @IsNumber()
  size: number;
}
