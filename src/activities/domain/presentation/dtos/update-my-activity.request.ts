import { IsNotEmpty } from 'class-validator';

export class UpdateMyActivityRequestRequest {
  @IsNotEmpty()
  timeOfDayId: string;
  @IsNotEmpty()
  dayOfWeekId: string;
}
