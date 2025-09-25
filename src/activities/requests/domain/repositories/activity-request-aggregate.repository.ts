import { ActivityRequestAggregate } from '../aggregates/activity-request.aggregate';

export const ActivityRequestAggregateRepository = Symbol(
  'ActivityRequestAggregateRepository',
);
export interface ActivityRequestAggregateRepository {
  createNew(
    activityRequestAggregate: ActivityRequestAggregate,
  ): Promise<ActivityRequestAggregate['id']>;
}
