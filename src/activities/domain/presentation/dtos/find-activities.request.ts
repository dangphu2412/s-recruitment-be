import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class FindActivitiesRequest {
  @IsDateString()
  fromDate: string;

  @IsDateString()
  toDate: string;

  @IsOptional()
  @IsUUID('4')
  authorId?: string;
}
