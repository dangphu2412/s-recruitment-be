import { IsNotEmpty, IsNumber } from 'class-validator';

export class ScoringStandardDto {
  @IsNotEmpty()
  standard: string;

  @IsNumber()
  point: number;
}
