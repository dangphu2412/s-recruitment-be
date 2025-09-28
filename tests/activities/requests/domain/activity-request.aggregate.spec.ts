import { ActivityRequestAggregate } from '../../../../src/activities/requests/domain/aggregates/activity-request.aggregate';
import {
  RequestActivityStatus,
  RequestTypes,
} from '../../../../src/system/database/entities/activity-request.entity';
import { ApprovalRequestAction } from '../../../../src/activities/shared/request-activity-status.enum';
import {
  ActivityRequestApprovedEvent,
  ActivityRequestRevisedEvent,
  AuthorUpdateActivityRequestEvent,
} from '../../../../src/activities/requests/domain/events/activiy-request.event';
import { InvalidStateError } from '../../../../src/system/data-domain-driven/invalid-state.exception';

export class ActivityRequestAggregateTestBuilder {
  private data: any = {
    authorId: 'user-123',
    requestType: RequestTypes.WORKING,
    timeOfDayId: 'morning',
    dayOfWeekId: 'monday',
    assigneeId: 'trainer-456',
  };

  static aWorkingRequest(): ActivityRequestAggregateTestBuilder {
    return new ActivityRequestAggregateTestBuilder()
      .withRequestType(RequestTypes.WORKING)
      .withDayOfWeekId('monday');
  }

  static aLateRequest(): ActivityRequestAggregateTestBuilder {
    return new ActivityRequestAggregateTestBuilder()
      .withRequestType(RequestTypes.LATE)
      .withActivityRef('act-id-1')
      .withRequestChangeDay('2024-01-15')
      .withReason('Traffic jam');
  }

  static anAbsenceRequest(): ActivityRequestAggregateTestBuilder {
    return new ActivityRequestAggregateTestBuilder()
      .withRequestType(RequestTypes.ABSENCE)
      .withActivityRef('act-id-1')
      .withRequestChangeDay('2024-01-15')
      .withCompensatoryDay('2024-01-16');
  }

  withAuthorId(authorId: string): ActivityRequestAggregateTestBuilder {
    this.data.authorId = authorId;
    return this;
  }

  withRequestType(
    requestType: RequestTypes,
  ): ActivityRequestAggregateTestBuilder {
    this.data.requestType = requestType;
    return this;
  }

  withActivityRef(ref): ActivityRequestAggregateTestBuilder {
    this.data.activityReferenceId = ref;
    return this;
  }

  withTimeOfDayId(timeOfDayId: string): ActivityRequestAggregateTestBuilder {
    this.data.timeOfDayId = timeOfDayId;
    return this;
  }

  withDayOfWeekId(dayOfWeekId: string): ActivityRequestAggregateTestBuilder {
    this.data.dayOfWeekId = dayOfWeekId;
    return this;
  }

  withRequestChangeDay(
    requestChangeDay: string,
  ): ActivityRequestAggregateTestBuilder {
    this.data.requestChangeDay = requestChangeDay;
    return this;
  }

  withCompensatoryDay(
    compensatoryDay: string,
  ): ActivityRequestAggregateTestBuilder {
    this.data.compensatoryDay = compensatoryDay;
    return this;
  }

  withReason(reason: string): ActivityRequestAggregateTestBuilder {
    this.data.reason = reason;
    return this;
  }

  withAssigneeId(assigneeId: string): ActivityRequestAggregateTestBuilder {
    this.data.assigneeId = assigneeId;
    return this;
  }

  build(): ActivityRequestAggregate {
    return ActivityRequestAggregate.createNew(this.data);
  }

  buildWithId(id: number): ActivityRequestAggregate {
    const aggregate = this.build();
    aggregate.id = id;
    return aggregate;
  }
}

// Additional edge case tests
describe('ActivityRequestAggregate - Edge Cases', () => {
  describe('boundary conditions', () => {
    it('should handle empty optional fields correctly', () => {
      // Arrange
      const aggregate = ActivityRequestAggregateTestBuilder.aWorkingRequest()
        .withReason('')
        .build();

      // Act & Assert
      expect(aggregate.reason).toBeUndefined();
      expect(aggregate.compensatoryDay).toBeUndefined();
      expect(aggregate.requestChangeDay).toBeUndefined();
    });

    it('should handle undefined optional fields correctly', () => {
      // Arrange
      const aggregate =
        ActivityRequestAggregateTestBuilder.aWorkingRequest().build();

      // Act & Assert
      expect(aggregate.reason).toBeUndefined();
      expect(aggregate.compensatoryDay).toBeUndefined();
      expect(aggregate.requestChangeDay).toBeUndefined();
    });
  });

  describe('state transitions - comprehensive', () => {
    it('should handle complete approval workflow', () => {
      // Arrange
      const aggregate =
        ActivityRequestAggregateTestBuilder.aLateRequest().buildWithId(1);

      // Act - First revision
      aggregate.updateApprovalStatus({
        action: ApprovalRequestAction.REVISE,
        approverId: 'trainer-1',
        reviseNote: 'Need more info',
      });

      // Assert - After revision
      expect(aggregate.approvalStatus).toBe(RequestActivityStatus.REVISE);
      expect(aggregate.reviseNote).toBe('Need more info');

      aggregate.updateByAuthor({
        dayOfWeekId: 'id',
        timeOfDayId: 'id',
      });

      expect(aggregate.approvalStatus).toBe(RequestActivityStatus.PENDING);

      aggregate.updateApprovalStatus({
        action: ApprovalRequestAction.APPROVE,
        approverId: 'trainer-2',
      });

      // Assert - After approval
      expect(aggregate.approvalStatus).toBe(RequestActivityStatus.APPROVED);
      expect(aggregate.approverId).toBe('trainer-2');
      expect(aggregate.needsActivityCreation()).toBe(true);
    });

    it('should track all state changes in domain events', () => {
      // Arrange
      const aggregate =
        ActivityRequestAggregateTestBuilder.aLateRequest().buildWithId(1);

      // Act
      aggregate.updateApprovalStatus({
        action: ApprovalRequestAction.REVISE,
        approverId: 'trainer-1',
        reviseNote: 'Need more info',
      });
      aggregate.updateByAuthor({
        dayOfWeekId: 'id',
        timeOfDayId: 'id',
      });
      aggregate.updateApprovalStatus({
        action: ApprovalRequestAction.APPROVE,
        approverId: 'trainer-2',
      });

      // Assert
      const events = aggregate.getDomainEvents();
      expect(events).toHaveLength(3);
      expect(events[0]).toBeInstanceOf(ActivityRequestRevisedEvent);
      expect(events[1]).toBeInstanceOf(AuthorUpdateActivityRequestEvent);
      expect(events[2]).toBeInstanceOf(ActivityRequestApprovedEvent);
    });
  });

  describe('validation edge cases', () => {
    it('should reject WORKING request with missing timeOfDayId', () => {
      // Arrange
      const invalidData = {
        authorId: 'user-123',
        requestType: RequestTypes.WORKING,
        // timeOfDayId is missing
        dayOfWeekId: 'monday',
        assigneeId: 'trainer-456',
      };

      // Act & Assert
      expect(() =>
        ActivityRequestAggregate.createNew(invalidData as any),
      ).toThrow(InvalidStateError);
    });

    it('should reject LATE request with missing requestChangeDay', () => {
      // Arrange
      const invalidData = {
        authorId: 'user-123',
        requestType: RequestTypes.LATE,
        timeOfDayId: 'morning',
        // requestChangeDay is missing
        reason: 'Traffic',
        assigneeId: 'trainer-456',
      };

      // Act & Assert
      expect(() => ActivityRequestAggregate.createNew(invalidData)).toThrow(
        InvalidStateError,
      );
    });

    it('should reject ABSENCE request with missing timeOfDayId', () => {
      // Arrange
      const invalidData = {
        authorId: 'user-123',
        requestType: RequestTypes.ABSENCE,
        // timeOfDayId is missing
        requestChangeDay: '2024-01-15',
        compensatoryDay: '2024-01-16',
        assigneeId: 'trainer-456',
      };

      // Act & Assert
      expect(() =>
        ActivityRequestAggregate.createNew(invalidData as any),
      ).toThrow(InvalidStateError);
    });
  });

  describe('domain events edge cases', () => {
    it('should handle rapid successive status changes', () => {
      // Arrange
      const aggregate =
        ActivityRequestAggregateTestBuilder.aLateRequest().buildWithId(1);

      // Act
      aggregate.updateApprovalStatus({
        action: ApprovalRequestAction.REJECT,
        approverId: 'trainer-1',
        rejectReason: 'Invalid',
      });
      aggregate.updateApprovalStatus({
        action: ApprovalRequestAction.REVISE,
        approverId: 'trainer-1',
        reviseNote: 'Actually, please revise',
      });

      // Assert
      expect(aggregate.getDomainEvents()).toHaveLength(2);
      expect(aggregate.approvalStatus).toBe(RequestActivityStatus.REVISE);
    });
  });

  describe('immutability and data integrity', () => {
    it('should not modify original creation data', () => {
      // Arrange
      const originalData = {
        authorId: 'user-123',
        requestType: RequestTypes.WORKING as RequestTypes,
        timeOfDayId: 'morning',
        dayOfWeekId: 'monday',
        assigneeId: 'trainer-456',
      };
      const dataCopy = { ...originalData };

      // Act
      const aggregate = ActivityRequestAggregate.createNew(originalData);
      aggregate.updateApprovalStatus({
        action: ApprovalRequestAction.APPROVE,
        approverId: 'trainer-789',
      });

      // Assert
      expect(originalData).toEqual(dataCopy);
      expect(originalData.authorId).toBe('user-123'); // Unchanged
    });

    it('should return independent copies of domain events', () => {
      // Arrange
      const aggregate =
        ActivityRequestAggregateTestBuilder.aLateRequest().buildWithId(1);

      aggregate.updateApprovalStatus({
        action: ApprovalRequestAction.APPROVE,
        approverId: 'trainer-789',
      });

      // Act
      const events1 = aggregate.getDomainEvents();
      const events2 = aggregate.getDomainEvents();
      events1.push({} as any); // Modify first copy

      // Assert
      expect(events1).toHaveLength(2);
      expect(events2).toHaveLength(1);
      expect(events1).not.toBe(events2);
    });

    it('should preserve aggregate state after getting domain events', () => {
      // Arrange
      const aggregate =
        ActivityRequestAggregateTestBuilder.aLateRequest().buildWithId(1);

      const originalAuthor = aggregate.authorId;

      // Act
      aggregate.updateApprovalStatus({
        action: ApprovalRequestAction.APPROVE,
        approverId: 'trainer-789',
      });
      const events = aggregate.getDomainEvents();

      // Assert
      expect(aggregate.approvalStatus).toBe(RequestActivityStatus.APPROVED);
      expect(aggregate.authorId).toBe(originalAuthor);
      expect(events).toHaveLength(1);
    });
  });

  describe('error handling edge cases', () => {
    it('should provide clear error messages for invalid transitions', () => {
      // Arrange
      const aggregate =
        ActivityRequestAggregateTestBuilder.aLateRequest().buildWithId(1);

      aggregate.updateApprovalStatus({
        action: ApprovalRequestAction.APPROVE,
        approverId: 'trainer-789',
      });

      // Act & Assert
      expect(() =>
        aggregate.updateApprovalStatus({
          action: ApprovalRequestAction.REJECT,
          approverId: 'trainer-999',
          rejectReason: 'Too late',
        }),
      ).toThrow('Cannot transition from APPROVED with action REJECT');
    });

    it('should handle null and undefined values in approval data', () => {
      // Arrange
      const aggregate =
        ActivityRequestAggregateTestBuilder.aLateRequest().buildWithId(1);

      // Act & Assert - Null reject reason
      expect(() =>
        aggregate.updateApprovalStatus({
          action: ApprovalRequestAction.REJECT,
          approverId: 'trainer-789',
          rejectReason: null as any,
        }),
      ).toThrow('Reject reason is required for rejection');

      // Act & Assert - Undefined revise note
      expect(() =>
        aggregate.updateApprovalStatus({
          action: ApprovalRequestAction.REVISE,
          approverId: 'trainer-789',
          reviseNote: undefined,
        }),
      ).toThrow('Revise note is required for revision');
    });

    it('should handle empty strings in approval data', () => {
      // Arrange
      const aggregate =
        ActivityRequestAggregateTestBuilder.aLateRequest().buildWithId(1);

      // Act & Assert - Empty reject reason
      expect(() =>
        aggregate.updateApprovalStatus({
          action: ApprovalRequestAction.REJECT,
          approverId: 'trainer-789',
          rejectReason: '',
        }),
      ).toThrow('Reject reason is required for rejection');

      // Act & Assert - Empty revise note
      expect(() =>
        aggregate.updateApprovalStatus({
          action: ApprovalRequestAction.REVISE,
          approverId: 'trainer-789',
          reviseNote: '',
        }),
      ).toThrow('Revise note is required for revision');
    });
  });

  describe('business rules consistency', () => {
    it('should maintain consistent state between isApproved and needsActivityCreation', () => {
      // Arrange
      const workingRequest =
        ActivityRequestAggregateTestBuilder.aWorkingRequest().buildWithId(1);

      // Act - Before approval
      const beforeNeedsActivity = workingRequest.needsActivityCreation();

      workingRequest.updateApprovalStatus({
        action: ApprovalRequestAction.APPROVE,
        approverId: 'trainer-789',
      });

      // Act - After approval
      const afterNeedsActivity = workingRequest.needsActivityCreation();

      // Assert
      expect(beforeNeedsActivity).toBe(false);
      expect(afterNeedsActivity).toBe(true);
    });

    it('should ensure updatedAt is set when status changes', () => {
      // Arrange
      const aggregate =
        ActivityRequestAggregateTestBuilder.aLateRequest().buildWithId(1);

      const originalUpdatedAt = aggregate.updatedAt;

      // Wait a bit to ensure timestamp difference
      const beforeUpdate = new Date();

      // Act
      aggregate.updateApprovalStatus({
        action: ApprovalRequestAction.APPROVE,
        approverId: 'trainer-789',
      });

      // Assert
      expect(aggregate.updatedAt).toBeDefined();
      expect(aggregate.updatedAt.getTime()).toBeGreaterThanOrEqual(
        beforeUpdate.getTime(),
      );
      if (originalUpdatedAt) {
        expect(aggregate.updatedAt.getTime()).toBeGreaterThan(
          originalUpdatedAt.getTime(),
        );
      }
    });
  });

  describe('data completeness validation', () => {
    it('should validate all required fields are present for each request type', () => {
      // Test data completeness matrix
      const testCases = [
        {
          type: RequestTypes.WORKING,
          requiredFields: ['timeOfDayId', 'dayOfWeekId'],
          validData: { timeOfDayId: 'morning', dayOfWeekId: 'monday' },
          missingFieldTest: { timeOfDayId: 'morning' }, // missing dayOfWeekId
        },
        {
          type: RequestTypes.LATE,
          requiredFields: [
            'timeOfDayId',
            'requestChangeDay',
            'reason',
            'activityReferenceId',
          ],
          validData: {
            timeOfDayId: 'morning',
            requestChangeDay: '2024-01-15',
            reason: 'Traffic',
            activityReferenceId: 'act-2',
          },
          missingFieldTest: {
            timeOfDayId: 'morning',
            requestChangeDay: '2024-01-15',
          }, // missing reason
        },
        {
          type: RequestTypes.ABSENCE,
          requiredFields: [
            'timeOfDayId',
            'requestChangeDay',
            'compensatoryDay',
            'activityReferenceId',
          ],
          validData: {
            timeOfDayId: 'morning',
            requestChangeDay: '2024-01-15',
            compensatoryDay: '2024-01-16',
            activityReferenceId: 'act-2',
          },
          missingFieldTest: {
            timeOfDayId: 'morning',
            requestChangeDay: '2024-01-15',
          }, // missing compensatoryDay
        },
      ];

      testCases.forEach(({ type, validData, missingFieldTest }) => {
        // Test valid case
        const validRequestData = {
          authorId: 'user-123',
          requestType: type,
          assigneeId: 'trainer-456',
          ...validData,
        };

        expect(() =>
          ActivityRequestAggregate.createNew(validRequestData),
        ).not.toThrow();

        // Test missing field case
        const invalidRequestData = {
          authorId: 'user-123',
          requestType: type,
          assigneeId: 'trainer-456',
          ...missingFieldTest,
        };

        expect(() =>
          ActivityRequestAggregate.createNew(invalidRequestData),
        ).toThrow(InvalidStateError);
      });
    });
  });
});
