import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsNotEmpty,
  IsUUID,
  ValidateNested,
  IsNumberString,
} from 'class-validator';
import { DateRange } from 'src/system/query-shape/dto/date-range.query';

export class CreateRecruitmentEventRequest {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  location: string;

  @IsNotEmpty()
  passPoint: number;

  @IsNotEmpty()
  @Type(() => DateRange)
  @ValidateNested()
  recruitmentRange: DateRange;

  @IsUUID(4, {
    each: true,
  })
  @ArrayNotEmpty()
  examinerIds: string[];

  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ScoringStandardDto)
  scoringStandards: ScoringStandardDto[];
}

export class ScoringStandardDto {
  @IsNotEmpty()
  standard: string;

  @IsNumberString()
  point: number;
}
