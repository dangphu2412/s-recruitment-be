import { Type } from 'class-transformer';
import { ToManyString } from '../../../shared/transformer';

export class ExtractNewUserQueryDto {
  field: string;

  @Type(() => String)
  @ToManyString()
  value: string[];
}
