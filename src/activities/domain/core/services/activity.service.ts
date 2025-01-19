import { createInterfaceToken } from '../../../../system/utils';
import { CreateActivityDTO } from '../dtos/create-activity.dto';
import {
  FindActivitiesDTO,
  FindActivitiesResponseDTO,
} from '../dtos/find-activities.dto';

export const ActivityServiceToken = createInterfaceToken('ActivityService');

export interface ActivityService {
  findActivities(dto: FindActivitiesDTO): Promise<FindActivitiesResponseDTO>;
  createActivity(dto: CreateActivityDTO): Promise<void>;
}
