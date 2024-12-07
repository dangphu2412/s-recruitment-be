import { createInterfaceToken } from '../../../../system/utils';
import { CreateActivityDTO } from '../dtos/create-activity.dto';

export const ActivityServiceToken = createInterfaceToken('ActivityService');

export interface ActivityService {
  createActivity(dto: CreateActivityDTO): Promise<void>;
}
