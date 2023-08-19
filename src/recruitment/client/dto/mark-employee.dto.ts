import { IsNotEmpty, IsNumber } from 'class-validator';

export class MarkEmployeeDto {
  @IsNotEmpty()
  @IsNumber()
  eventId: number;

  @IsNotEmpty()
  employeeId: string;

  @IsNotEmpty()
  point: number;
}
