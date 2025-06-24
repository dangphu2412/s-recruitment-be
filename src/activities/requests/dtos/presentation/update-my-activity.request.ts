import { IsNotEmpty, IsString, ValidateIf } from 'class-validator';
import { RequestTypes } from '../../../shared/request-activity-status.enum';

export class UpdateMyActivityRequestRequest {
  @IsNotEmpty()
  timeOfDayId: string;

  @IsString()
  @ValidateIf((o) => o.requestType === RequestTypes.WORKING)
  dayOfWeekId: string;
}
