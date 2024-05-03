import { Type } from 'class-transformer';
import { ToManyString } from '../../../../system/decorators/transformer';

export class ExtractNewUserQueryDto {
  field: string;

  @Type(() => String)
  @ToManyString()
  value: string[];
}
