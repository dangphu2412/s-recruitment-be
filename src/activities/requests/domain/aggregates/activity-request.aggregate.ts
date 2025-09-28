import { AggregateRoot } from '../../../../system/data-domain-driven/aggregate.interface';
import {
  RequestActivityStatus,
  RequestTypes,
} from '../../../../system/database/entities/activity-request.entity';
import { NewRequestInvalidInputException } from '../exceptions/new-request.exception';
import { InvalidStateError } from '../../../../system/data-domain-driven/invalid-state.exception';
import { DomainEvent } from '../../../../system/data-domain-driven/domain-event.interface';
import {
  ActivityRequestApprovedEvent,
  ActivityRequestRejectedEvent,
  ActivityRequestRevisedEvent,
  AuthorUpdateActivityRequestEvent,
} from '../events/activiy-request.event';
import { ApprovalRequestAction } from '../../../shared/request-activity-status.enum';

type NewActivityRequestAggregate = {
  authorId: string;
  requestType: string;
  timeOfDayId: string;
  dayOfWeekId?: string;
  requestChangeDay?: string;
  compensatoryDay?: string;
  reason?: string;
  assigneeId: string;
  activityReferenceId?: string;
};

type UpdateApprovalStatusActivityRequestAggregate = {
  action: ApprovalRequestAction;
  approverId: string;
  rejectReason?: string;
  reviseNote?: string;
};

type AuthorUpdatesActivityRequestAggregate = {
  timeOfDayId: string;
  dayOfWeekId?: string;
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
  activityReferenceId: string | null;

  private domainEvents: DomainEvent<number>[] = [];

  // Domain events management
  getDomainEvents(): DomainEvent<number>[] {
    return [...this.domainEvents];
  }

  clearDomainEvents(): void {
    this.domainEvents = [];
  }

  private addDomainEvent(event: DomainEvent<number>): void {
    this.domainEvents.push(event);
  }

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

    if (newActivityRequestAggregate.activityReferenceId) {
      aggregate.activityReferenceId =
        newActivityRequestAggregate.activityReferenceId;
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
          !aggregate.reason ||
          !aggregate.activityReferenceId
        ) {
          throw new InvalidStateError('Missing info of late request');
        }
        break;
      case RequestTypes.ABSENCE:
        if (
          !aggregate.timeOfDayId ||
          !aggregate.requestChangeDay ||
          !aggregate.compensatoryDay ||
          !aggregate.activityReferenceId
        ) {
          throw new InvalidStateError('Missing info of absense request');
        }
        break;
      default:
    }
  }

  updateApprovalStatus({
    approverId,
    reviseNote,
    rejectReason,
    action,
  }: UpdateApprovalStatusActivityRequestAggregate): void {
    const nextStatus = this.getNextApprovalStatusByAction(action);

    if (!nextStatus) {
      throw new InvalidStateError(
        `Cannot transition from ${this.approvalStatus} with action ${action}`,
      );
    }

    this.approvalStatus = nextStatus;
    this.updatedAt = new Date();

    switch (action) {
      case ApprovalRequestAction.APPROVE:
        this.approverId = approverId;
        this.addDomainEvent(
          new ActivityRequestApprovedEvent(
            this.id,
            {
              authorId: this.authorId,
              requestType: this.requestType,
              timeOfDayId: this.timeOfDayId,
              dayOfWeekId: this.dayOfWeekId,
              requestChangeDay: this.requestChangeDay,
              compensatoryDay: this.compensatoryDay,
            },
            approverId,
          ),
        );
        break;

      case ApprovalRequestAction.REJECT:
        if (!rejectReason) {
          throw new InvalidStateError(
            'Reject reason is required for rejection',
          );
        }
        this.rejectReason = rejectReason;
        this.addDomainEvent(
          new ActivityRequestRejectedEvent(
            this.id,
            this.authorId,
            rejectReason,
          ),
        );
        break;

      case ApprovalRequestAction.REVISE:
        if (!reviseNote) {
          throw new InvalidStateError('Revise note is required for revision');
        }
        this.reviseNote = reviseNote;
        this.addDomainEvent(
          new ActivityRequestRevisedEvent(this.id, this.authorId, reviseNote),
        );
        break;
    }
  }

  private getNextApprovalStatusByAction(
    action: ApprovalRequestAction,
  ): RequestActivityStatus | null {
    const currentStatus: RequestActivityStatus = this.approvalStatus;
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
      [RequestActivityStatus.REVISE]: {
        [ApprovalRequestAction.AUTHOR_UPDATE]: {
          nextState: RequestActivityStatus.PENDING,
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

  needsActivityCreation(): boolean {
    return (
      this.approvalStatus === RequestActivityStatus.APPROVED &&
      [RequestTypes.WORKING, RequestTypes.LATE, RequestTypes.ABSENCE].includes(
        this.requestType,
      )
    );
  }

  updateByAuthor({
    dayOfWeekId,
    timeOfDayId,
  }: AuthorUpdatesActivityRequestAggregate) {
    if (RequestActivityStatus.REVISE !== this.approvalStatus) {
      throw new Error('Request must be in revise status');
    }

    const nextStatus = this.getNextApprovalStatusByAction(
      ApprovalRequestAction.AUTHOR_UPDATE,
    );

    if (!nextStatus) {
      throw new InvalidStateError(
        `Cannot transition from ${this.approvalStatus} with action ${ApprovalRequestAction.AUTHOR_UPDATE}`,
      );
    }

    this.approvalStatus = nextStatus;
    this.updatedAt = new Date();
    this.timeOfDayId = timeOfDayId;

    if (dayOfWeekId) {
      this.dayOfWeekId = dayOfWeekId;
    }

    this.addDomainEvent(
      new AuthorUpdateActivityRequestEvent(
        this.id,
        this.authorId,
        this.timeOfDayId,
        this.dayOfWeekId,
      ),
    );
  }
}
