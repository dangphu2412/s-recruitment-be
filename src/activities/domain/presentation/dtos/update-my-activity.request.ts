import { IsNotEmpty } from 'class-validator';

export class UpdateMyActivityRequestRequest {
  @IsNotEmpty()
  timeOfDay: string;
  @IsNotEmpty()
  dayOfWeek: string;
}
