import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { ActivityRequestService } from './domain/core/services/activity-request.service';
import { ActivityRequest } from './domain/data-access/activity-request.entity';
import {
  ApprovalRequestAction,
  RequestActivityStatus,
} from './domain/core/constants/request-activity-status.enum';
import { CreateActivityRequestDTO } from './domain/core/dtos/create-activity-request.dto';
import { FindRequestedMyActivitiesResponseDTO } from './domain/core/dtos/find-requested-my-acitivities.dto';
import { Page, PageRequest } from '../system/query-shape/dto';
import {
  FindRequestedActivitiesResponseDTO,
  FindRequestedActivityQueryDTO,
} from './domain/core/dtos/find-requested-acitivities.dto';
import { UpdateApprovalActivityRequestDTO } from './domain/core/dtos/update-approval-activity-request.dto';
import { Transactional } from 'typeorm-transactional';
import {
  ActivityService,
  ActivityServiceToken,
} from './domain/core/services/activity.service';
import { FindRequestedMyActivityResponseDTO } from './domain/core/dtos/find-requested-my-acitivity.dto';
import { UpdateMyActivityRequestDTO } from './domain/core/dtos/update-my-activity-request.dto';

@Injectable()
export class ActivityRequestServiceImpl implements ActivityRequestService {
  constructor(
    @InjectRepository(ActivityRequest)
    private readonly activityRequestRepository: Repository<ActivityRequest>,
    @Inject(ActivityServiceToken)
    private readonly activityService: ActivityService,
  ) {}

  async findMyRequestedActivities(
    userId: string,
  ): Promise<FindRequestedMyActivitiesResponseDTO> {
    const items = await this.activityRequestRepository.find({
      where: { authorId: userId },
      relations: ['author', 'dayOfWeek', 'timeOfDay'],
    });

    return Page.of({
      items,
      totalRecords: items.length,
      query: {
        page: 1,
        size: 10,
      },
    });
  }

  async findRequestedActivities({
    query,
    page,
    size,
  }: FindRequestedActivityQueryDTO): Promise<FindRequestedActivitiesResponseDTO> {
    const { offset } = PageRequest.of({ page, size });
    const items = await this.activityRequestRepository.find({
      where: {
        ...(query
          ? {
              author: {
                fullName: ILike(`%${query}%`),
              },
            }
          : {}),
      },
      relations: ['author', 'dayOfWeek', 'timeOfDay'],
      order: {
        updatedAt: 'DESC',
      },
      skip: offset,
      take: size,
    });

    return Page.of({
      items,
      totalRecords: items.length,
      query: {
        page: 1,
        size: 10,
      },
    });
  }

  findMyRequestedActivity(
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

  async createRequestActivity(dto: CreateActivityRequestDTO): Promise<void> {
    await this.activityRequestRepository.insert({
      ...dto,
      approvalStatus: RequestActivityStatus.PENDING,
    });
  }

  @Transactional()
  async updateApprovalRequestActivity(
    dto: UpdateApprovalActivityRequestDTO,
  ): Promise<void> {
    const { id, action, rejectReason, reviseNote } = dto;

    const activityRequest = await this.activityRequestRepository.findOneBy({
      id,
    });

    if (!activityRequest) {
      throw new Error('Activity request not found');
    }

    const nextStatus = this.getNextState(
      activityRequest.approvalStatus,
      action,
    );

    await this.activityRequestRepository.update(id, {
      approvalStatus: nextStatus,
      ...(rejectReason ? { rejectReason } : {}),
      ...(reviseNote ? { reviseNote } : {}),
    });

    if (RequestActivityStatus.APPROVED === nextStatus) {
      await this.activityService.createActivity({
        authorId: activityRequest.authorId,
        requestType: activityRequest.requestType,
        timeOfDayId: activityRequest.timeOfDayId,
        dayOfWeekId: activityRequest.dayOfWeekId,
        requestChangeDay: activityRequest.requestChangeDay,
        compensatoryDay: activityRequest.compensatoryDay,
      });
    }
  }

  private getNextState(
    currentStatus: RequestActivityStatus,
    action: ApprovalRequestAction,
  ): RequestActivityStatus {
    const transitions = {
      [RequestActivityStatus.PENDING]: {
        [ApprovalRequestAction.APPROVE]: {
          nextState: RequestActivityStatus.APPROVED,
        },
        [ApprovalRequestAction.REJECT]: {
          nextState: RequestActivityStatus.REJECTED,
        },
        [ApprovalRequestAction.REVISE]: {
          nextState: RequestActivityStatus.REVISE,
        },
      },
      [RequestActivityStatus.REJECTED]: {
        [ApprovalRequestAction.REVISE]: {
          nextState: RequestActivityStatus.REVISE,
        },
      },
    };

    const transition = transitions[currentStatus];

    if (!transition) {
      throw new Error('Invalid state transition');
    }

    return transition[action].nextState;
  }

  async updateMyRequestActivity(dto: UpdateMyActivityRequestDTO) {
    const request = await this.activityRequestRepository.findOne({
      where: {
        id: dto.id,
        authorId: dto.authorId,
      },
    });

    if (!request) {
      throw new Error('Request not found');
    }

    if (RequestActivityStatus.REVISE !== request.approvalStatus) {
      throw new Error('Request is not in revise status');
    }

    await this.activityRequestRepository.update(dto.id, {
      ...dto,
      approvalStatus: RequestActivityStatus.PENDING,
    });
  }
}
