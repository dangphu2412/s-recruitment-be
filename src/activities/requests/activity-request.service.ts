import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ActivityRequestService } from '../domain/core/services/activity-request.service';
import { ActivityRequest } from '../domain/data-access/activity-request.entity';
import {
  ApprovalRequestAction,
  RequestActivityStatus,
  RequestTypes,
} from '../domain/core/constants/request-activity-status.enum';
import { CreateActivityRequestDTO } from '../domain/core/dtos/create-activity-request.dto';
import { FindRequestedMyActivitiesResponseDTO } from '../domain/core/dtos/find-requested-my-acitivities.dto';
import { Page, PageRequest } from '../../system/query-shape/dto';
import {
  FindRequestedActivitiesResponseDTO,
  FindRequestedActivityQueryDTO,
} from '../domain/core/dtos/find-requested-acitivities.dto';
import { UpdateApprovalActivityRequestDTO } from '../domain/core/dtos/update-approval-activity-request.dto';
import { Transactional } from 'typeorm-transactional';
import {
  ActivityService,
  ActivityServiceToken,
} from '../domain/core/services/activity.service';
import { FindRequestedMyActivityResponseDTO } from '../domain/core/dtos/find-requested-my-acitivity.dto';
import { UpdateMyActivityRequestDTO } from '../domain/core/dtos/update-my-activity-request.dto';

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
    departmentIds,
    fromDate,
    toDate,
    status,
  }: FindRequestedActivityQueryDTO): Promise<FindRequestedActivitiesResponseDTO> {
    const { offset } = PageRequest.of({ page, size });

    const queryBuilder = this.activityRequestRepository
      .createQueryBuilder('activity')
      .leftJoinAndSelect('activity.author', 'author')
      .leftJoinAndSelect('activity.dayOfWeek', 'dayOfWeek')
      .leftJoinAndSelect('activity.timeOfDay', 'timeOfDay');

    if (query) {
      queryBuilder.andWhere('author.fullName ILIKE :query', {
        query: `%${query}%`,
      });
    }

    if (departmentIds) {
      queryBuilder.leftJoinAndSelect('author.department', 'department');
      queryBuilder.andWhere('department.id IN (:...departmentIds)', {
        departmentIds,
      });
    }

    if (status) {
      queryBuilder.andWhere('activity.approvalStatus IN (:...status)', {
        status,
      });
    }

    if (fromDate) {
      queryBuilder.andWhere('activity.updatedAt >= :fromDate', {
        fromDate,
      });
    }

    if (toDate) {
      queryBuilder.andWhere('activity.updatedAt <= :toDate', {
        toDate,
      });
    }

    queryBuilder
      .skip(offset)
      .take(size)
      .addOrderBy('activity.updatedAt', 'DESC');

    const [items, totalRecords] = await queryBuilder.getManyAndCount();

    return Page.of({
      items,
      totalRecords,
      query: {
        page,
        size,
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
    const entity = this.mapRequestActivityToEntity(dto);

    await this.activityRequestRepository.insert(entity);
  }

  private mapRequestActivityToEntity(
    dto: CreateActivityRequestDTO,
  ): ActivityRequest {
    if (dto.requestType === RequestTypes.WORKING) {
      const entity = new ActivityRequest();
      entity.authorId = dto.authorId;
      entity.requestType = dto.requestType;
      entity.timeOfDayId = dto.timeOfDayId;
      entity.dayOfWeekId = dto.dayOfWeekId;
      entity.approvalStatus = RequestActivityStatus.PENDING;
      return entity;
    }

    if (dto.requestType === RequestTypes.LATE) {
      const entity = new ActivityRequest();
      entity.authorId = dto.authorId;
      entity.requestType = dto.requestType;
      entity.timeOfDayId = dto.timeOfDayId;
      entity.requestChangeDay = dto.requestChangeDay;
      entity.reason = dto.reason;
      entity.approvalStatus = RequestActivityStatus.PENDING;

      return entity;
    }

    if (dto.requestType === RequestTypes.ABSENCE) {
      const entity = new ActivityRequest();
      entity.authorId = dto.authorId;
      entity.requestType = dto.requestType;
      entity.timeOfDayId = dto.timeOfDayId;
      entity.requestChangeDay = dto.requestChangeDay;
      entity.compensatoryDay = dto.compensatoryDay;
      entity.reason = dto.reason;
      entity.approvalStatus = RequestActivityStatus.PENDING;

      return entity;
    }

    throw new InternalServerErrorException('Invalid request type');
  }

  @Transactional()
  async updateApprovalRequestActivity(
    dto: UpdateApprovalActivityRequestDTO,
  ): Promise<void> {
    const { ids, action, rejectReason, reviseNote } = dto;

    const activityRequests = await this.activityRequestRepository.findBy({
      id: In(ids),
    });

    if (!activityRequests.length) {
      throw new Error('Activity request not found');
    }

    await Promise.all(
      activityRequests.map(async (activityRequest) => {
        const nextStatus = this.getNextState(
          activityRequest.approvalStatus,
          action,
        );

        if (!nextStatus) {
          return;
        }

        await this.activityRequestRepository.update(activityRequest.id, {
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
      }),
    );
  }

  private getNextState(
    currentStatus: RequestActivityStatus,
    action: ApprovalRequestAction,
  ): RequestActivityStatus | null {
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
      return null;
    }

    if (!transition[action]) {
      return null;
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
