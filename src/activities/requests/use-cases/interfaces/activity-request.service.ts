import { CreateActivityRequestDTO } from '../dtos/create-activity-request.dto';
import { UpdateMyActivityRequestDTO } from '../dtos/update-my-activity-request.dto';
import { UpdateApprovalActivityRequestDTO } from '../dtos/update-approval-activity-request.dto';
import { FileActivityRequestDTO } from '../dtos/file-create-activity-request.dto';

export const ActivityRequestService = Symbol('ActivityRequestService');

export interface ActivityRequestService {
  createRequestActivity(dto: CreateActivityRequestDTO): Promise<void>;
  createRequestActivityByFile(dto: FileActivityRequestDTO): Promise<void>;
  updateMyRequestActivity(dto: UpdateMyActivityRequestDTO): Promise<void>;
  updateApprovalRequestActivity(
    dto: UpdateApprovalActivityRequestDTO,
  ): Promise<void>;
}
