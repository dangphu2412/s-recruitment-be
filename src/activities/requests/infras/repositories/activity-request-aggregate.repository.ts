import { Injectable } from '@nestjs/common';
import { ActivityRequestAggregateRepository } from '../../domain/repositories/activity-request-aggregate.repository';
import { ActivityRequestAggregate } from '../../domain/aggregates/activity-request.aggregate';
import { DataSource } from 'typeorm';
import { ActivityRequest } from '../../../../system/database/entities/activity-request.entity';
import { plainToClass } from 'class-transformer';

@Injectable()
export class ActivityRequestAggregateRepositoryImpl
  implements ActivityRequestAggregateRepository
{
  constructor(private readonly dataSource: DataSource) {}

  async createNew(
    activityRequestAggregate: ActivityRequestAggregate,
  ): Promise<number> {
    const entity = this.fromAggregateToEntity(activityRequestAggregate);

    const { identifiers } = await this.dataSource.manager.insert(
      ActivityRequest,
      entity,
    );

    return parseInt(identifiers[0].id as string, 10);
  }

  private fromAggregateToEntity(
    aggregate: ActivityRequestAggregate,
  ): ActivityRequest {
    return plainToClass(ActivityRequest, { ...aggregate });
  }
}
