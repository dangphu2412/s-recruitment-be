import { Brackets, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Activity } from './domain/data-access/activity.entity';
import { FindActivitiesDTO } from './domain/core/dtos/find-activities.dto';
import { RequestTypes } from './domain/core/constants/request-activity-status.enum';

@Injectable()
export class ActivityRepository extends Repository<Activity> {
  constructor(
    @InjectRepository(Activity)
    repository: Repository<Activity>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  findActivities({ fromDate, toDate }: FindActivitiesDTO) {
    const queryBuilder = this.createQueryBuilder('activity');

    // Find all member activities requestType is working
    // And activity of absense and late in time range
    // And the author is still active
    queryBuilder
      .leftJoinAndSelect('activity.author', 'author')
      .leftJoinAndSelect('activity.timeOfDay', 'timeOfDay')
      .leftJoinAndSelect('activity.dayOfWeek', 'dayOfWeek')
      .andWhere('activity.requestType = :requestType', {
        requestType: RequestTypes.WORKING,
      })
      .orWhere(
        new Brackets((qb) => {
          qb.andWhere('activity.requestType IN (:...requestType2)', {
            requestType2: [RequestTypes.ABSENCE, RequestTypes.LATE],
          }).andWhere('activity.createdAt BETWEEN :fromDate AND :toDate', {
            fromDate,
            toDate,
          });

          return qb;
        }),
      );

    return queryBuilder.getMany();
  }
}
