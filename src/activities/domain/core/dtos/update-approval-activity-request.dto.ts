import { ApprovalRequestAction } from '../constants/request-activity-status.enum';

export type UpdateApprovalActivityRequestDTO = {
  id: number;
  authorId: string;
  action: ApprovalRequestAction;
};
