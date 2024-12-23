import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { RequestTypes } from '../../core/constants/request-activity-status.enum';

export class CreateActivityRequestRequest {
  @IsEnum(RequestTypes)
  requestType: string;

  @IsNotEmpty()
  timeOfDayId: string;

  @IsOptional()
  @IsString()
  dayOfWeekId: string;

  @IsOptional()
  @IsDateString()
  requestChangeDay?: string;

  @IsOptional()
  @IsDateString()
  compensatoryDay?: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
