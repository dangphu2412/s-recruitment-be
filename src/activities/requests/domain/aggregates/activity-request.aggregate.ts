import { AggregateRoot } from '../../../../system/data-domain-driven/aggregate';
import {
  RequestActivityStatus,
  RequestTypes,
} from '../../../../system/database/entities/activity-request.entity';
import { NewRequestInvalidInputException } from '../exceptions/new-request.exception';
import { InvalidStateError } from '../../../../system/data-domain-driven/invalid-state.exception';

type NewActivityRequestAggregate = {
  authorId: string;
  requestType: string;
  timeOfDayId: string;
  dayOfWeekId?: string;
  requestChangeDay?: string;
  compensatoryDay?: string;
  reason?: string;
  assigneeId: string;
};

export class ActivityRequestAggregate implements AggregateRoot<number> {
  id: number;
  rejectReason: string;
  reason: string | null;
  compensatoryDay: string | null;
  requestChangeDay: string | null;
  reviseNote: string | null;
  requestType: RequestTypes;
  approvalStatus: RequestActivityStatus;
  createdAt: Date;
  updatedAt: Date;
  timeOfDayId: string;
  dayOfWeekId?: string;
  authorId: string;
  assigneeId: string;
  approverId: string | null;

  static createNew(
    newActivityRequestAggregate: NewActivityRequestAggregate,
  ): ActivityRequestAggregate {
    const aggregate = new ActivityRequestAggregate();
    aggregate.authorId = newActivityRequestAggregate.authorId;
    aggregate.requestType =
      newActivityRequestAggregate.requestType as RequestTypes;
    aggregate.timeOfDayId = newActivityRequestAggregate.timeOfDayId;

    if (newActivityRequestAggregate.dayOfWeekId) {
      aggregate.dayOfWeekId = newActivityRequestAggregate.dayOfWeekId;
    }

    if (newActivityRequestAggregate.requestChangeDay) {
      aggregate.requestChangeDay = newActivityRequestAggregate.requestChangeDay;
    }

    if (newActivityRequestAggregate.compensatoryDay) {
      aggregate.compensatoryDay = newActivityRequestAggregate.compensatoryDay;
    }

    if (newActivityRequestAggregate.reason) {
      aggregate.reason = newActivityRequestAggregate.reason;
    }

    aggregate.assigneeId = newActivityRequestAggregate.assigneeId;
    aggregate.approvalStatus = RequestActivityStatus.PENDING;

    ActivityRequestAggregate.ensureValidNewState(aggregate);

    return aggregate;
  }

  static ensureValidNewState(aggregate: ActivityRequestAggregate): void {
    if (
      ![RequestTypes.WORKING, RequestTypes.LATE, RequestTypes.ABSENCE].includes(
        aggregate.requestType,
      )
    ) {
      throw new NewRequestInvalidInputException();
    }

    switch (aggregate.requestType) {
      case RequestTypes.WORKING:
        if (!aggregate.timeOfDayId || !aggregate.dayOfWeekId) {
          throw new InvalidStateError('Missing info of working request');
        }
        break;
      case RequestTypes.LATE:
        if (
          !aggregate.timeOfDayId ||
          !aggregate.requestChangeDay ||
          !aggregate.reason
        ) {
          throw new InvalidStateError('Missing info of late request');
        }
        break;
      case RequestTypes.ABSENCE:
        if (
          !aggregate.timeOfDayId ||
          !aggregate.requestChangeDay ||
          !aggregate.compensatoryDay
        ) {
          throw new InvalidStateError('Missing info of absense request');
        }
        break;
      default:
    }
  }
}
