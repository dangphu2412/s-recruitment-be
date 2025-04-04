import { createInterfaceToken } from '../../../../system/utils';
import { CreateActivityRequestDTO } from '../dtos/create-activity-request.dto';
import { FindRequestedMyActivitiesResponseDTO } from '../dtos/find-requested-my-acitivities.dto';
import {
  FindRequestedActivitiesResponseDTO,
  FindRequestedActivityQueryDTO,
} from '../dtos/find-requested-acitivities.dto';
import { FindRequestedMyActivityResponseDTO } from '../dtos/find-requested-my-acitivity.dto';
import { UpdateMyActivityRequestDTO } from '../dtos/update-my-activity-request.dto';
import { UpdateApprovalActivityRequestDTO } from '../dtos/update-approval-activity-request.dto';
import { FileActivityRequestDTO } from '../dtos/file-create-activity-request.dto';

export const ActivityRequestServiceToken = createInterfaceToken(
  'ActivityRequestService',
);

export interface ActivityRequestService {
  findRequestedActivities(
    findRequestedActivityQueryDTO: FindRequestedActivityQueryDTO,
  ): Promise<FindRequestedActivitiesResponseDTO>;
  findMyRequestedActivities(
    userId: string,
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
