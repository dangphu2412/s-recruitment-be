import { IsNotEmpty } from 'class-validator';

export class CreateActivityRequestRequest {
  @IsNotEmpty()
  requestType: string;
  @IsNotEmpty()
  timeOfDayId: string;
  @IsNotEmpty()
  dayOfWeekId: string;
}
