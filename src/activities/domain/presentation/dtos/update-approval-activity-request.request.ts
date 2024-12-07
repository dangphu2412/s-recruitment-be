import { IsEnum } from 'class-validator';
import { ApprovalRequestAction } from '../../core/constants/request-activity-status.enum';

export class UpdateApprovalActivityRequestRequest {
  @IsEnum(ApprovalRequestAction)
  action: ApprovalRequestAction;
}
