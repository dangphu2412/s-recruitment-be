import { Type } from 'class-transformer';
import { DateRange } from 'src/system/query-shape/dto/date-range.query';
import {
  ArrayNotEmpty,
  IsNotEmpty,
  IsNumber,
  IsUUID,
  ValidateNested,
} from 'class-validator';

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

  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Type(() => Number)
  point: number;
}
