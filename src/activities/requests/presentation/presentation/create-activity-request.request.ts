import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsString,
  ValidateIf,
} from 'class-validator';
import { RequestTypes } from '../../../shared/request-activity-status.enum';

export class CreateActivityRequestRequest {
  @IsEnum(RequestTypes)
  requestType: string;

  @IsNotEmpty()
  timeOfDayId: string;

  @IsString()
  @ValidateIf((o) => o.requestType === RequestTypes.WORKING)
  dayOfWeekId: string;

  @IsDateString()
  @ValidateIf((o) =>
    [RequestTypes.LATE, RequestTypes.ABSENCE].includes(o.requestType),
  )
  requestChangeDay?: string;

  @IsDateString()
  @ValidateIf((o) => RequestTypes.ABSENCE === o.requestType)
  compensatoryDay?: string;

  @IsString()
  @ValidateIf((o) =>
    [RequestTypes.LATE, RequestTypes.ABSENCE].includes(o.requestType),
  )
  reason?: string;
}
