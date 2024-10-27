import { IsNotEmpty, IsNumberString } from 'class-validator';

export class ScoringStandardDto {
  @IsNotEmpty()
  standard: string;

  @IsNumberString()
  point: number;
}
