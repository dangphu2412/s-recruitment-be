import { Injectable } from '@nestjs/common';
import { ActivityService } from './interfaces/activity.service';
import { CreateActivityDTO } from './dtos/core/create-activity.dto';
import {
  FindActivitiesDTO,
  FindActivitiesResponseDTO,
} from './dtos/core/find-activities.dto';
import { ActivityRepository } from './activity.repository';
import { SearchMyActivitiesDTO } from './dtos/core/search-my-activities.dto';

@Injectable()
export class ActivityServiceImpl implements ActivityService {
  constructor(private readonly activityRepository: ActivityRepository) {}

  findActivities(dto: FindActivitiesDTO): Promise<FindActivitiesResponseDTO> {
    return this.activityRepository.findActivities(dto);
  }

  async createActivities(dto: CreateActivityDTO[]): Promise<void> {
    await this.activityRepository.insert(dto);
  }

  searchMy(dto: SearchMyActivitiesDTO): Promise<FindActivitiesResponseDTO> {
    return this.activityRepository.searchMy(dto);
  }
}
