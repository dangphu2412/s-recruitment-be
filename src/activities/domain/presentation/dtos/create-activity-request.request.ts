import { IsNotEmpty } from 'class-validator';

export class CreateActivityRequestRequest {
  @IsNotEmpty()
  requestType: string;
  @IsNotEmpty()
  timeOfDay: string;
  @IsNotEmpty()
  dayOfWeek: string;
}
