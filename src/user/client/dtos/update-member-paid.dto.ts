import { IsNumber, IsString, Min } from 'class-validator';

export class UpdateMemberPaidDto {
  @IsNumber()
  @Min(0)
  newPaid: number;

  @IsString()
  operationFeeId: string;
}
