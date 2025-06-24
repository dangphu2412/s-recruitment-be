import { Brackets, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Activity } from '../shared/entities/activity.entity';
import { FindActivitiesDTO } from './dtos/core/find-activities.dto';
import { RequestTypes } from '../shared/request-activity-status.enum';

@Injectable()
export class ActivityRepository extends Repository<Activity> {
  constructor(
    @InjectRepository(Activity)
    repository: Repository<Activity>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  findActivities({ fromDate, toDate, authorId }: FindActivitiesDTO) {
    const queryBuilder = this.createQueryBuilder('activity');

    // Find all member activities requestType is working
    // And activity of absense and late in time range
    // And the author is still active

    queryBuilder
      .leftJoinAndSelect('activity.author', 'author')
      .leftJoinAndSelect('activity.timeOfDay', 'timeOfDay')
      .leftJoinAndSelect('activity.dayOfWeek', 'dayOfWeek')
      .andWhere(
        new Brackets((qb) => {
          qb.andWhere('activity.requestType = :requestType', {
            requestType: RequestTypes.WORKING,
          })
            .orWhere(
              new Brackets((qb) => {
                qb.andWhere('activity.requestType = :requestType3', {
                  requestType3: RequestTypes.ABSENCE,
                }).andWhere(
                  'activity.compensatoryDay BETWEEN :fromDate AND :toDate',
                  {
                    fromDate,
                    toDate,
                  },
                );

                return qb;
              }),
            )
            .orWhere(
              new Brackets((qb) => {
                qb.andWhere('activity.requestType = :requestType2', {
                  requestType2: RequestTypes.LATE,
                }).andWhere(
                  'activity.requestChangeDay BETWEEN :fromDate AND :toDate',
                  {
                    fromDate,
                    toDate,
                  },
                );

                return qb;
              }),
            );
        }),
      );

    if (authorId) {
      queryBuilder.andWhere('activity.authorId = :authorId', { authorId });
    }

    return queryBuilder.getMany();
  }

  findActivitiesByDeviceUserIds(deviceUserIds: string[]) {
    return this.createQueryBuilder('activity')
      .leftJoinAndSelect('activity.author', 'author')
      .leftJoinAndSelect('activity.timeOfDay', 'timeOfDay')
      .leftJoinAndSelect('activity.dayOfWeek', 'dayOfWeek')
      .andWhere('author.trackingId IN (:...deviceUserIds)', {
        deviceUserIds: deviceUserIds,
      })
      .getMany();
  }
}
