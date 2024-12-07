import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityService } from './domain/core/services/activity.service';
import { Activity } from './domain/data-access/activity.entity';
import { CreateActivityDTO } from './domain/core/dtos/create-activity.dto';

@Injectable()
export class ActivityServiceImpl implements ActivityService {
  constructor(
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
  ) {}

  async createActivity(dto: CreateActivityDTO): Promise<void> {
    await this.activityRepository.insert(dto);
  }
}
