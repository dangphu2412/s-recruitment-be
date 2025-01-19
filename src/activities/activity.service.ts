import { Injectable } from '@nestjs/common';
import { ActivityService } from './domain/core/services/activity.service';
import { CreateActivityDTO } from './domain/core/dtos/create-activity.dto';
import {
  FindActivitiesDTO,
  FindActivitiesResponseDTO,
} from './domain/core/dtos/find-activities.dto';
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
