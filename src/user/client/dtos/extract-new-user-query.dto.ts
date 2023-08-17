import { Type } from 'class-transformer';
import { ToManyString } from '../../../system/transformer';

export class ExtractNewUserQueryDto {
  field: string;

  @Type(() => String)
  @ToManyString()
  value: string[];
}
