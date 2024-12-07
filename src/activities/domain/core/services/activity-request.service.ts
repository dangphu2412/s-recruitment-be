import { createInterfaceToken } from '../../../../system/utils';
import { CreateActivityRequestDTO } from '../dtos/create-activity-request.dto';
import { FindRequestedMyActivitiesResponseDTO } from '../dtos/find-requested-my-acitivities.dto';
import { FindRequestedActivitiesResponseDTO } from '../dtos/find-requested-acitivities.dto';
import { UpdateApprovalActivityRequestDTO } from '../dtos/update-approval-activity-request.dto';

export const ActivityRequestServiceToken = createInterfaceToken(
  'ActivityRequestService',
);

export interface ActivityRequestService {
  findRequestedActivities(): Promise<FindRequestedActivitiesResponseDTO>;
  findMyRequestedActivities(
    userId: string,
  ): Promise<FindRequestedMyActivitiesResponseDTO>;
  createRequestActivity(dto: CreateActivityRequestDTO): Promise<void>;
  updateApprovalRequestActivity(
    dto: UpdateApprovalActivityRequestDTO,
  ): Promise<void>;
}
