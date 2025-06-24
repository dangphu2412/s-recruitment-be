import { createProviderToken } from '../../../system/nestjs-extensions';
import { CreateActivityRequestDTO } from '../dtos/core/create-activity-request.dto';
import {
  FindRequestedActivitiesResponseDTO,
  FindRequestedActivityQueryDTO,
} from '../dtos/core/find-requested-acitivities.dto';
import { FindRequestedMyActivityResponseDTO } from '../dtos/core/find-requested-my-acitivity.dto';
import { UpdateMyActivityRequestDTO } from '../dtos/core/update-my-activity-request.dto';
import { UpdateApprovalActivityRequestDTO } from '../dtos/core/update-approval-activity-request.dto';
import { FileActivityRequestDTO } from '../dtos/core/file-create-activity-request.dto';
import {
  FindMyRequestedActivityQueryDTO,
  FindRequestedMyActivitiesResponseDTO,
} from '../dtos/core/find-my-requested-acitivities.dto';

export const ActivityRequestServiceToken = createProviderToken(
  'ActivityRequestService',
);

export interface ActivityRequestService {
  findRequestedActivities(
    findRequestedActivityQueryDTO: FindRequestedActivityQueryDTO,
  ): Promise<FindRequestedActivitiesResponseDTO>;
  findMyRequestedActivities(
    findMyRequestedActivitiesRequest: FindMyRequestedActivityQueryDTO,
  ): Promise<FindRequestedMyActivitiesResponseDTO>;
  findMyRequestedActivity(
    id: number,
    userId: string,
  ): Promise<FindRequestedMyActivityResponseDTO>;
  createRequestActivity(dto: CreateActivityRequestDTO): Promise<void>;
  createRequestActivityByFile(dto: FileActivityRequestDTO): Promise<void>;
  updateMyRequestActivity(dto: UpdateMyActivityRequestDTO): Promise<void>;
  updateApprovalRequestActivity(
    dto: UpdateApprovalActivityRequestDTO,
  ): Promise<void>;
}
