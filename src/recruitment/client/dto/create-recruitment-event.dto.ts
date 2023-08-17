import {
  ArrayNotEmpty,
  IsNotEmpty,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { DateRange } from '@shared/query-shape/filter/entities/date-range.query';
import { Type } from 'class-transformer';

export class CreateRecruitmentEventDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  location: string;

  @IsNotEmpty()
  @Type(() => DateRange)
  @ValidateNested()
  recruitmentRange: DateRange;

  @IsUUID(4, {
    each: true,
  })
  @ArrayNotEmpty()
  examinerIds: string[];
}
