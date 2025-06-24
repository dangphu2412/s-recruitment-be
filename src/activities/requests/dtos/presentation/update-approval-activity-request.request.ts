import { IsEnum, IsNumber } from 'class-validator';
import { ApprovalRequestAction } from '../../../shared/request-activity-status.enum';

export class UpdateApprovalActivityRequestRequest {
  @IsEnum(ApprovalRequestAction)
  action: ApprovalRequestAction;

  @IsNumber({}, { each: true })
  ids: number[];
}
