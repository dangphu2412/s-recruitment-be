import { createProviderToken } from '../../../system/nestjs-extensions';
import { CreateActivityDTO } from '../dtos/core/create-activity.dto';
import {
  FindActivitiesDTO,
  FindActivitiesResponseDTO,
} from '../dtos/core/find-activities.dto';

export const ActivityServiceToken = createProviderToken('ActivityService');

export interface ActivityService {
  findActivities(dto: FindActivitiesDTO): Promise<FindActivitiesResponseDTO>;
  createActivity(dto: CreateActivityDTO): Promise<void>;
}
