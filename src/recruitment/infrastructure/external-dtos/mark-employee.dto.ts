import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class MarkEmployeeDto {
  @IsNotEmpty()
  @IsNumber()
  eventId: number;

  @IsNotEmpty()
  @IsNumber()
  employeeId: number;

  @IsNotEmpty()
  point: number;

  @IsOptional()
  note: string;
}
