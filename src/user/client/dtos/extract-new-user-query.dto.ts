import { Transform, Type } from 'class-transformer';

export class ExtractNewUserQueryDto {
  field: string;

  @Type(() => String)
  @Transform((params) => params.value.split(','))
  value: string[];
}
