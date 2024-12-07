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
      relations: ['author'],
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
      relations: ['author'],
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
    const { id, action } = dto;

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
    });

    if (ApprovalRequestAction.APPROVE === command) {
      await this.activityService.createActivity({
        authorId: activity.authorId,
        requestType: activity.requestType,
        timeOfDay: activity.timeOfDay,
        dayOfWeek: activity.dayOfWeek,
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
      },
      [RequestActivityStatus.APPROVED]: {
        [ApprovalRequestAction.REVISE]: {
          nextState: RequestActivityStatus.PENDING,
        },
      },
      [RequestActivityStatus.REJECTED]: {
        [ApprovalRequestAction.REVISE]: {
          nextState: RequestActivityStatus.PENDING,
        },
      },
    };

    const transition = transitions[currentStatus];

    if (!transition) {
      throw new Error('Invalid transition');
    }

    return transition[action];
  }
}
