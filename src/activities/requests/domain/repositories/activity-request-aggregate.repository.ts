import { ActivityRequestAggregate } from '../aggregates/activity-request.aggregate';

export const ActivityRequestAggregateRepository = Symbol(
  'ActivityRequestAggregateRepository',
);
export interface ActivityRequestAggregateRepository {
  createNew(
    activityRequestAggregate: ActivityRequestAggregate,
  ): Promise<ActivityRequestAggregate['id']>;
  findByIds(
    ids: ActivityRequestAggregate['id'][],
  ): Promise<ActivityRequestAggregate[]>;
  findMyUpdateRequestById(
    id: ActivityRequestAggregate['id'],
    authorId: ActivityRequestAggregate['authorId'],
  ): Promise<ActivityRequestAggregate | null>;
  updateMany(
    activityRequestAggregates: ActivityRequestAggregate[],
  ): Promise<void>;
}
