import { Inject, Injectable } from '@nestjs/common';
import { In } from 'typeorm';
import { OffsetPaginationResponse } from '../../../system/pagination';
import {
  FindRequestedActivitiesResponseDTO,
  FindRequestedActivityQueryDTO,
} from './dtos/find-requested-acitivities.dto';
import { FindRequestedMyActivityResponseDTO } from './dtos/find-requested-my-acitivity.dto';
import {
  FindMyRequestedActivityQueryDTO,
  FindRequestedMyActivitiesResponseDTO,
} from './dtos/find-my-requested-acitivities.dto';
import { ActivityRequestRepository } from '../infras/repositories/activity-request.repository';
import { ActivityRequestQueryService } from './interfaces/activity-request-query.service';

@Injectable()
export class ActivityRequestQueryServiceImpl
  implements ActivityRequestQueryService
{
  constructor(
    @Inject(ActivityRequestRepository)
    private readonly activityRequestRepository: ActivityRequestRepository,
  ) {}

  async search(
    dto: FindRequestedActivityQueryDTO,
  ): Promise<FindRequestedActivitiesResponseDTO> {
    return this.activityRequestRepository.findOverviewRequests(dto);
  }

  async searchMy({
    userId,
    status,
  }: FindMyRequestedActivityQueryDTO): Promise<FindRequestedMyActivitiesResponseDTO> {
    const items = await this.activityRequestRepository.find({
      where: {
        authorId: userId,
        ...(status ? { approvalStatus: In(status) } : {}),
      },
      relations: ['author', 'dayOfWeek', 'timeOfDay'],
    });

    return OffsetPaginationResponse.of({
      items,
      totalRecords: items.length,
      query: {
        page: 1,
        size: 10,
      },
    });
  }

  findMyById(
    id: number,
    userId: string,
  ): Promise<FindRequestedMyActivityResponseDTO> {
    return this.activityRequestRepository.findOne({
      where: {
        id,
        authorId: userId,
      },
      relations: ['author', 'dayOfWeek', 'timeOfDay'],
    });
  }

  findById(id: number): Promise<FindRequestedMyActivityResponseDTO> {
    return this.activityRequestRepository.findDetailById(id);
  }
}
