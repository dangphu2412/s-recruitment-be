import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatePaymentRequest {
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  paidAt: string;

  @IsString()
  note: string;
}
