import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ActivityRequest } from '../../../../system/database/entities/activity-request.entity';
import {
  FindRequestedActivitiesResponseDTO,
  FindRequestedActivityQueryDTO,
} from '../../use-cases/dtos/find-requested-acitivities.dto';
import { OffsetPaginationRequest } from '../../../../system/pagination/offset-pagination-request';
import { OffsetPaginationResponse } from '../../../../system/pagination';

export const ActivityRequestRepository = Symbol('ActivityRequestRepository');
export interface ActivityRequestRepository extends Repository<ActivityRequest> {
  findDetailById(id: number): Promise<ActivityRequest>;
  findOverviewRequests(
    findRequestedActivityQueryDTO: FindRequestedActivityQueryDTO,
  ): Promise<FindRequestedActivitiesResponseDTO>;
}

@Injectable()
export class ActivityRequestRepositoryImpl
  extends Repository<ActivityRequest>
  implements ActivityRequestRepository
{
  constructor(
    @InjectRepository(ActivityRequest)
    repository: Repository<ActivityRequest>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  findDetailById(id: number): Promise<ActivityRequest> {
    return this.createQueryBuilder('activity_request')
      .withDeleted()
      .leftJoin('activity_request.author', 'author')
      .addSelect(['author.id', 'author.fullName'])
      .leftJoin('activity_request.assignee', 'assignee')
      .addSelect(['assignee.id', 'assignee.fullName', 'assignee.email'])
      .leftJoin('activity_request.approver', 'approver')
      .addSelect(['approver.id', 'approver.fullName', 'approver.email'])
      .leftJoin('activity_request.dayOfWeek', 'dayOfWeek')
      .addSelect(['dayOfWeek.id', 'dayOfWeek.name'])
      .leftJoin('activity_request.timeOfDay', 'timeOfDay')
      .addSelect([
        'timeOfDay.id',
        'timeOfDay.name',
        'timeOfDay.fromTime',
        'timeOfDay.toTime',
      ])
      .andWhere('activity_request.id = :id', { id })
      .getOne();
  }

  async findOverviewRequests({
    query,
    page,
    size,
    departmentIds,
    fromDate,
    toDate,
    status,
    requestTypes,
  }: FindRequestedActivityQueryDTO): Promise<FindRequestedActivitiesResponseDTO> {
    const offset = OffsetPaginationRequest.getOffset(page, size);

    /**
     * Select specific fields: https://stackoverflow.com/questions/62390886/select-specific-columns-from-left-join-query-typeorm
     */
    const queryBuilder = this.createQueryBuilder('activity_request')
      .withDeleted()
      .leftJoin('activity_request.author', 'author')
      .addSelect(['author.id', 'author.fullName'])
      .leftJoin('activity_request.assignee', 'assignee')
      .addSelect(['assignee.id', 'assignee.fullName'])
      .leftJoin('activity_request.approver', 'approver')
      .addSelect(['approver.id', 'approver.fullName'])
      .leftJoin('activity_request.dayOfWeek', 'dayOfWeek')
      .addSelect(['dayOfWeek.id', 'dayOfWeek.name'])
      .leftJoin('activity_request.timeOfDay', 'timeOfDay')
      .addSelect([
        'timeOfDay.id',
        'timeOfDay.name',
        'timeOfDay.fromTime',
        'timeOfDay.toTime',
      ]);

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
      queryBuilder.andWhere('activity_request.approvalStatus IN (:...status)', {
        status,
      });
    }

    if (requestTypes) {
      queryBuilder.andWhere(
        'activity_request.requestType IN (:...requestTypes)',
        {
          requestTypes,
        },
      );
    }

    if (fromDate) {
      queryBuilder.andWhere('activity_request.updatedAt >= :fromDate', {
        fromDate,
      });
    }

    if (toDate) {
      queryBuilder.andWhere('activity_request.updatedAt <= :toDate', {
        toDate,
      });
    }

    queryBuilder
      .skip(offset)
      .take(size)
      .addOrderBy('activity_request.updatedAt', 'DESC');

    const [items, totalRecords] = await queryBuilder.getManyAndCount();

    return OffsetPaginationResponse.of({
      items,
      totalRecords,
      query: {
        page,
        size,
      },
    });
  }
}
