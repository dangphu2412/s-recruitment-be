import { Injectable } from '@nestjs/common';
import { ActivityService } from './interfaces/activity.service';
import { CreateActivityDTO } from './dtos/core/create-activity.dto';
import {
  FindActivitiesDTO,
  FindActivitiesResponseDTO,
} from './dtos/core/find-activities.dto';
import { ActivityRepository } from './activity.repository';

@Injectable()
export class ActivityServiceImpl implements ActivityService {
  constructor(private readonly activityRepository: ActivityRepository) {}

  findActivities(dto: FindActivitiesDTO): Promise<FindActivitiesResponseDTO> {
    return this.activityRepository.findActivities(dto);
  }

  async createActivity(dto: CreateActivityDTO): Promise<void> {
    await this.activityRepository.insert(dto);
  }
}
