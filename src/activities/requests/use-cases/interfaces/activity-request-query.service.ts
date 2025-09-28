import {
  FindRequestedActivitiesResponseDTO,
  FindRequestedActivityQueryDTO,
} from '../dtos/find-requested-acitivities.dto';
import { FindRequestedMyActivityResponseDTO } from '../dtos/find-requested-my-acitivity.dto';
import {
  FindMyRequestedActivityQueryDTO,
  FindRequestedMyActivitiesResponseDTO,
} from '../dtos/find-my-requested-acitivities.dto';

export const ActivityRequestQueryService = Symbol(
  'ActivityRequestQueryService',
);

export interface ActivityRequestQueryService {
  search(
    findRequestedActivityQueryDTO: FindRequestedActivityQueryDTO,
  ): Promise<FindRequestedActivitiesResponseDTO>;
  searchMy(
    findMyRequestedActivitiesRequest: FindMyRequestedActivityQueryDTO,
  ): Promise<FindRequestedMyActivitiesResponseDTO>;
  findMyById(
    id: number,
    userId: string,
  ): Promise<FindRequestedMyActivityResponseDTO>;
  findById(id: number): Promise<FindRequestedMyActivityResponseDTO>;
}
