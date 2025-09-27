import { DomainEvent } from '../../../../system/data-domain-driven/domain-event.interface';
import { RequestTypes } from '../../../../system/database/entities/activity-request.entity';

export class ActivityRequestApprovedEvent implements DomainEvent<number> {
  constructor(
    public readonly aggregateId: number,
    public readonly activityData: {
      authorId: string;
      requestType: RequestTypes;
      timeOfDayId: string;
      dayOfWeekId?: string;
      requestChangeDay?: string;
      compensatoryDay?: string;
    },
    public readonly approverId: string,
    public readonly occurredAt: Date = new Date(),
  ) {}
}

export class ActivityRequestRejectedEvent implements DomainEvent<number> {
  constructor(
    public readonly aggregateId: number,
    public readonly authorId: string,
    public readonly rejectReason: string,
    public readonly occurredAt: Date = new Date(),
  ) {}
}

export class ActivityRequestRevisedEvent implements DomainEvent<number> {
  constructor(
    public readonly aggregateId: number,
    public readonly authorId: string,
    public readonly reviseNote: string,
    public readonly occurredAt: Date = new Date(),
  ) {}
}

export class AuthorUpdateActivityRequestEvent implements DomainEvent<number> {
  constructor(
    public readonly aggregateId: number,
    public readonly authorId: string,
    public readonly timeOfDayId: string,
    public readonly dayOfWeekId?: string,
    public readonly occurredAt: Date = new Date(),
  ) {}
}
