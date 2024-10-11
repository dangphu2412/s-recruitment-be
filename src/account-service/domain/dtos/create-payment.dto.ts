import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatePaymentDto {
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  paidAt: string;

  @IsString()
  note: string;
}
