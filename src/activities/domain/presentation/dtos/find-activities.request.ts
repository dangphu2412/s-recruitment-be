import { IsDateString } from 'class-validator';

export class FindActivitiesRequest {
  @IsDateString()
  fromDate: string;

  @IsDateString()
  toDate: string;
}
