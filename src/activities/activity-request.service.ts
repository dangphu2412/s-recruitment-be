import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityRequestService } from './domain/core/services/activity-request.service';
import { ActivityRequest } from './domain/data-access/activity-request.entity';
import {
  ApprovalRequestAction,
  RequestActivityStatus,
} from './domain/core/constants/request-activity-status.enum';
import { CreateActivityRequestDTO } from './domain/core/dtos/create-activity-request.dto';
import { FindRequestedMyActivitiesResponseDTO } from './domain/core/dtos/find-requested-my-acitivities.dto';
import { Page } from '../system/query-shape/dto';
import { FindRequestedActivitiesResponseDTO } from './domain/core/dtos/find-requested-acitivities.dto';
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

  async findRequestedActivities(): Promise<FindRequestedActivitiesResponseDTO> {
    const items = await this.activityRequestRepository.find({
      relations: ['author', 'dayOfWeek', 'timeOfDay'],
      order: {
        updatedAt: 'DESC',
      },
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

  async createRequestActivity(dto: CreateActivityRequestDTO): Promise<any> {
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

    const activity = await this.activityRequestRepository.findOneBy({ id });

    if (!activity) {
      throw new Error('Activity not found');
    }

    const { nextState, command } = this.getNextState(
      activity.approvalStatus,
      action,
    );

    await this.activityRequestRepository.update(id, {
      approvalStatus: nextState,
      ...(rejectReason ? { rejectReason } : {}),
      ...(reviseNote ? { reviseNote } : {}),
    });

    if (ApprovalRequestAction.APPROVE === command) {
      await this.activityService.createActivity({
        authorId: activity.authorId,
        requestType: activity.requestType,
        timeOfDayId: activity.timeOfDayId,
        dayOfWeekId: activity.dayOfWeekId,
      });
    }
  }

  private getNextState(
    currentStatus: RequestActivityStatus,
    action: ApprovalRequestAction,
  ) {
    const transitions = {
      [RequestActivityStatus.PENDING]: {
        [ApprovalRequestAction.APPROVE]: {
          nextState: RequestActivityStatus.APPROVED,
          command: ApprovalRequestAction.APPROVE,
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

    return transition[action];
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
