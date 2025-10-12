import { IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class MarkLeaveRequest {
  @IsNotEmpty()
  @Type(() => Date)
  leaveAt: Date;
  @IsNotEmpty()
  leaveReason: string;
}
