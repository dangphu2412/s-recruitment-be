import { IsNotEmpty } from 'class-validator';

export class ImportEmployeesDto {
  @IsNotEmpty()
  eventId: string;
}
