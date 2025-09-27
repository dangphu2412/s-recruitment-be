import { Injectable } from '@nestjs/common';
import { ActivityRequestAggregateRepository } from '../../domain/repositories/activity-request-aggregate.repository';
import { ActivityRequestAggregate } from '../../domain/aggregates/activity-request.aggregate';
import { DataSource, In } from 'typeorm';
import {
  ActivityRequest,
  RequestActivityStatus,
} from '../../../../system/database/entities/activity-request.entity';
import { plainToClass } from 'class-transformer';
import { parseInt } from 'lodash';

@Injectable()
export class ActivityRequestAggregateRepositoryImpl
  implements ActivityRequestAggregateRepository
{
  constructor(private readonly dataSource: DataSource) {}

  private static fromAggregateToEntity(
    aggregate: ActivityRequestAggregate,
  ): ActivityRequest {
    return plainToClass(ActivityRequest, { ...aggregate });
  }

  private static fromEntityToAggregate(
    entity: ActivityRequest,
  ): ActivityRequestAggregate {
    return plainToClass(ActivityRequestAggregate, { ...entity });
  }

  async createNew(
    activityRequestAggregate: ActivityRequestAggregate,
  ): Promise<number> {
    const entity = ActivityRequestAggregateRepositoryImpl.fromAggregateToEntity(
      activityRequestAggregate,
    );

    const { identifiers } = await this.dataSource.manager.insert(
      ActivityRequest,
      entity,
    );

    return parseInt(identifiers[0].id as string, 10);
  }

  async findByIds(
    ids: ActivityRequestAggregate['id'][],
  ): Promise<ActivityRequestAggregate[]> {
    const entities = await this.dataSource.manager.findBy(ActivityRequest, {
      id: In(ids),
    });

    return entities.map(
      ActivityRequestAggregateRepositoryImpl.fromEntityToAggregate,
    );
  }

  async findMyUpdateRequestById(
    id: ActivityRequestAggregate['id'],
    authorId: ActivityRequestAggregate['authorId'],
  ): Promise<ActivityRequestAggregate> {
    const entity = await this.dataSource.manager.findOneBy(ActivityRequest, {
      id: id,
      authorId: authorId,
      approvalStatus: RequestActivityStatus.REVISE,
    });

    if (!entity) return null;

    return ActivityRequestAggregateRepositoryImpl.fromEntityToAggregate(entity);
  }

  async updateMany(
    activityRequestAggregates: ActivityRequestAggregate[],
  ): Promise<void> {
    const entities = activityRequestAggregates.map(
      ActivityRequestAggregateRepositoryImpl.fromAggregateToEntity,
    );

    await this.dataSource.manager.save(entities);
  }
}
