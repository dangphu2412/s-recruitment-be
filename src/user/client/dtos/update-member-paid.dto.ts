import { IsNumber, Min } from 'class-validator';

export class UpdateMemberPaidDto {
  @IsNumber()
  @Min(0)
  newPaid: number;

  @IsNumber()
  operationFeeId: string;
}
