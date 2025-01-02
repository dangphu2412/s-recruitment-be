import { ApprovalRequestAction } from '../constants/request-activity-status.enum';

export type UpdateApprovalActivityRequestDTO = {
  ids: number[];
  authorId: string;
  action: ApprovalRequestAction;
  rejectReason?: string;
  reviseNote?: string;
};
