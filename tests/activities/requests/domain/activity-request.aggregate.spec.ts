import {
  RequestActivityStatus,
  RequestTypes,
} from '../../../../src/system/database/entities/activity-request.entity';
import { ActivityRequestAggregate } from '../../../../src/activities/requests/domain/aggregates/activity-request.aggregate';
import { InvalidStateError } from '../../../../src/system/data-domain-driven/invalid-state.exception';
import { NewRequestInvalidInputException } from '../../../../src/activities/requests/domain/exceptions/new-request.exception';

describe('ActivityRequestAggregate', () => {
  describe('createNew', () => {
    it('should create a valid WORKING request when all required fields are provided', () => {
      // Arrange
      const input = {
        authorId: 'author-1',
        assigneeId: 'assignee-1',
        requestType: RequestTypes.WORKING,
        timeOfDayId: 'time-1',
        dayOfWeekId: 'monday',
      };

      // Act
      const aggregate = ActivityRequestAggregate.createNew(input);

      // Assert
      expect(aggregate.authorId).toBe(input.authorId);
      expect(aggregate.assigneeId).toBe(input.assigneeId);
      expect(aggregate.requestType).toBe(RequestTypes.WORKING);
      expect(aggregate.approvalStatus).toBe(RequestActivityStatus.PENDING);
      expect(aggregate.dayOfWeekId).toBe(input.dayOfWeekId);
    });

    it('should throw InvalidStateError if WORKING request is missing dayOfWeekId', () => {
      // Arrange
      const input = {
        authorId: 'author-1',
        assigneeId: 'assignee-1',
        requestType: RequestTypes.WORKING,
        timeOfDayId: 'time-1',
      };

      // Act + Assert
      expect(() => ActivityRequestAggregate.createNew(input)).toThrow(
        InvalidStateError,
      );
    });

    it('should create a valid LATE request when all required fields are provided', () => {
      // Arrange
      const input = {
        authorId: 'author-2',
        assigneeId: 'assignee-2',
        requestType: RequestTypes.LATE,
        timeOfDayId: 'time-2',
        requestChangeDay: '2025-10-01',
        reason: 'traffic jam',
      };

      // Act
      const aggregate = ActivityRequestAggregate.createNew(input);

      // Assert
      expect(aggregate.requestType).toBe(RequestTypes.LATE);
      expect(aggregate.requestChangeDay).toBe(input.requestChangeDay);
      expect(aggregate.reason).toBe(input.reason);
    });

    it('should throw InvalidStateError if LATE request is missing reason', () => {
      // Arrange
      const input = {
        authorId: 'author-2',
        assigneeId: 'assignee-2',
        requestType: RequestTypes.LATE,
        timeOfDayId: 'time-2',
        requestChangeDay: '2025-10-01',
      };

      // Act + Assert
      expect(() => ActivityRequestAggregate.createNew(input)).toThrow(
        InvalidStateError,
      );
    });

    it('should create a valid ABSENCE request when all required fields are provided', () => {
      // Arrange
      const input = {
        authorId: 'author-3',
        assigneeId: 'assignee-3',
        requestType: RequestTypes.ABSENCE,
        timeOfDayId: 'time-3',
        requestChangeDay: '2025-10-05',
        compensatoryDay: '2025-10-10',
      };

      // Act
      const aggregate = ActivityRequestAggregate.createNew(input);

      // Assert
      expect(aggregate.requestType).toBe(RequestTypes.ABSENCE);
      expect(aggregate.requestChangeDay).toBe(input.requestChangeDay);
      expect(aggregate.compensatoryDay).toBe(input.compensatoryDay);
    });

    it('should throw InvalidStateError if ABSENCE request is missing compensatoryDay', () => {
      // Arrange
      const input = {
        authorId: 'author-3',
        assigneeId: 'assignee-3',
        requestType: RequestTypes.ABSENCE,
        timeOfDayId: 'time-3',
        requestChangeDay: '2025-10-05',
      };

      // Act + Assert
      expect(() => ActivityRequestAggregate.createNew(input)).toThrow(
        InvalidStateError,
      );
    });

    it('should throw NewRequestInvalidInputException if requestType is not valid', () => {
      // Arrange
      const input = {
        authorId: 'author-4',
        assigneeId: 'assignee-4',
        requestType: 'INVALID' as RequestTypes,
        timeOfDayId: 'time-4',
      };

      // Act + Assert
      expect(() => ActivityRequestAggregate.createNew(input)).toThrow(
        NewRequestInvalidInputException,
      );
    });
  });
});
