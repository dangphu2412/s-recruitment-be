import { IsDateString, IsNumber, IsOptional, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class FindActivitiesRequest {
  @IsDateString()
  fromDate: string;

  @IsDateString()
  toDate: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  dayOfWeekId?: number;

  @IsOptional()
  @IsUUID('4')
  authorId?: string;
}
