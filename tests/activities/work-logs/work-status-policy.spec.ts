import { Test } from '@nestjs/testing';
import { WorkStatusEvaluator } from '../../../src/activities/work-logs/work-status-evaluator.service';
import { TimeOfDay } from '../../../src/master-data-service/time-of-days/time-of-day.entity';
import { DayOfWeek } from '../../../src/master-data-service/day-of-weeks/day-of-week';
import { User } from '../../../src/account-service/domain/data-access/entities/user.entity';

describe('WorkStatusPolicy', () => {
  let workStatusPolicy: WorkStatusEvaluator;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [WorkStatusEvaluator],
    }).compile();

    workStatusPolicy = moduleRef.get(WorkStatusEvaluator);
  });

  describe('No activity found and return not finished', () => {
    it('should return not finished', async () => {
      expect(
        workStatusPolicy.evaluateStatus({
          activities: [],
          fromDateTime: '2025-03-10T01:29:00.000Z',
          toDateTime: '2025-03-10T04:31:00.000Z',
        }),
      ).toEqual('N');
    });
  });

  describe('Working on time', () => {
    it('[from, to] inside timeOfDay', async () => {
      expect(
        workStatusPolicy.evaluateStatus({
          activities: [
            {
              id: 1,
              requestType: 'Working',
              timeOfDay: {
                fromTime: '01:30:00',
                toTime: '04:30:00',
              } as unknown as TimeOfDay,
              compensatoryDay: '',
              requestChangeDay: '',
              timeOfDayId: '',
              dayOfWeekId: '',
              authorId: '',
              createdAt: undefined,
              updatedAt: undefined,
              author: {} as User,
              dayOfWeek: { id: '1' } as DayOfWeek,
            },
          ],
          fromDateTime: '2025-03-10T01:29:00.000Z',
          toDateTime: '2025-03-10T04:31:00.000Z',
        }),
      ).toEqual('O');
    });

    it('[from, to] equals timeOfDay', async () => {
      expect(
        workStatusPolicy.evaluateStatus({
          activities: [
            {
              id: 1,
              requestType: 'Working',
              timeOfDay: {
                fromTime: '01:30:00',
                toTime: '04:30:00',
              } as unknown as TimeOfDay,
              compensatoryDay: '',
              requestChangeDay: '',
              timeOfDayId: '',
              dayOfWeekId: '',
              authorId: '',
              createdAt: undefined,
              updatedAt: undefined,
              author: {} as User,
              dayOfWeek: { id: '1' } as DayOfWeek,
            },
          ],
          fromDateTime: '2025-03-10T01:30:00.000Z',
          toDateTime: '2025-03-10T04:30:00.000Z',
        }),
      ).toEqual('O');
    });

    it('[from, to] equals timeOfDay from 1 of activities.timeOfDay', async () => {
      expect(
        workStatusPolicy.evaluateStatus({
          activities: [
            {
              id: 3,
              requestType: 'Working',
              timeOfDay: {
                fromTime: '01:30:00',
                toTime: '04:30:00',
              } as unknown as TimeOfDay,
              compensatoryDay: '',
              requestChangeDay: '',
              timeOfDayId: '',
              dayOfWeekId: '',
              authorId: '',
              createdAt: undefined,
              updatedAt: undefined,
              author: {} as User,
              dayOfWeek: { id: '1' } as DayOfWeek,
            },
            {
              id: 2,
              requestType: 'Working',
              timeOfDay: {
                fromTime: '01:30:00',
                toTime: '04:30:00',
              } as unknown as TimeOfDay,
              compensatoryDay: '',
              requestChangeDay: '',
              timeOfDayId: '',
              dayOfWeekId: '',
              authorId: '',
              createdAt: undefined,
              updatedAt: undefined,
              author: {} as User,
              dayOfWeek: { id: '1' } as DayOfWeek,
            },
            {
              id: 1,
              requestType: 'Working',
              timeOfDay: {
                fromTime: '01:30:00',
                toTime: '04:30:00',
              } as unknown as TimeOfDay,
              compensatoryDay: '',
              requestChangeDay: '',
              timeOfDayId: '',
              dayOfWeekId: '',
              authorId: '',
              createdAt: undefined,
              updatedAt: undefined,
              author: {} as User,
              dayOfWeek: { id: '1' } as DayOfWeek,
            },
          ],
          fromDateTime: '2025-03-10T01:30:00.000Z',
          toDateTime: '2025-03-10T04:30:00.000Z',
        }),
      ).toEqual('O');
    });
  });

  describe('Working late', () => {
    it('[from, to] out of timeOfDay', async () => {
      expect(
        workStatusPolicy.evaluateStatus({
          activities: [
            {
              id: 1,
              requestType: 'Working',
              timeOfDay: {
                fromTime: '01:30:00',
                toTime: '04:30:00',
              } as unknown as TimeOfDay,
              compensatoryDay: '',
              requestChangeDay: '',
              timeOfDayId: '',
              dayOfWeekId: '',
              authorId: '',
              createdAt: undefined,
              updatedAt: undefined,
              author: {} as User,
              dayOfWeek: { id: '1' } as DayOfWeek,
            },
          ],
          fromDateTime: '2025-03-10T01:31:00.000Z',
          toDateTime: '2025-03-10T04:29:00.000Z',
        }),
      ).toEqual('L');
    });

    it('from < activities.timeOfDay.fromTime', async () => {
      expect(
        workStatusPolicy.evaluateStatus({
          activities: [
            {
              id: 1,
              requestType: 'Working',
              timeOfDay: {
                fromTime: '01:30:00',
                toTime: '04:30:00',
              } as unknown as TimeOfDay,
              compensatoryDay: '',
              requestChangeDay: '',
              timeOfDayId: '',
              dayOfWeekId: '',
              authorId: '',
              createdAt: undefined,
              updatedAt: undefined,
              author: {} as User,
              dayOfWeek: { id: '1' } as DayOfWeek,
            },
          ],
          fromDateTime: '2025-03-10T01:31:00.000Z',
          toDateTime: '2025-03-10T04:31:00.000Z',
        }),
      ).toEqual('L');
    });

    it('to < activities.timeOfDay.toTime', async () => {
      expect(
        workStatusPolicy.evaluateStatus({
          activities: [
            {
              id: 1,
              requestType: 'Working',
              timeOfDay: {
                fromTime: '01:30:00',
                toTime: '04:30:00',
              } as unknown as TimeOfDay,
              compensatoryDay: '',
              requestChangeDay: '',
              timeOfDayId: '',
              dayOfWeekId: '',
              authorId: '',
              createdAt: undefined,
              updatedAt: undefined,
              author: {} as User,
              dayOfWeek: { id: '1' } as DayOfWeek,
            },
          ],
          fromDateTime: '2025-03-10T01:30:00.000Z',
          toDateTime: '2025-03-10T04:29:00.000Z',
        }),
      ).toEqual('L');
    });
  });

  describe('Registered Late goes on time', () => {
    it('[from, to] inside timeOfDay', async () => {
      expect(
        workStatusPolicy.evaluateStatus({
          activities: [
            {
              id: 1,
              requestType: 'Late',
              timeOfDay: {
                fromTime: '01:30:00',
                toTime: '04:30:00',
              } as unknown as TimeOfDay,
              compensatoryDay: '',
              requestChangeDay: '2025-03-10T00:00:00.000Z',
              timeOfDayId: '',
              dayOfWeekId: '',
              authorId: '',
              createdAt: undefined,
              updatedAt: undefined,
              author: {} as User,
              dayOfWeek: { id: '1' } as DayOfWeek,
            },
          ],
          fromDateTime: '2025-03-10T01:44:00.000Z',
          toDateTime: '2025-03-10T04:31:00.000Z',
        }),
      ).toEqual('O');
    });

    it('[from, to] equals timeOfDay', async () => {
      expect(
        workStatusPolicy.evaluateStatus({
          activities: [
            {
              id: 1,
              requestType: 'Late',
              timeOfDay: {
                fromTime: '01:30:00',
                toTime: '04:30:00',
              } as unknown as TimeOfDay,
              compensatoryDay: '',
              requestChangeDay: '2025-03-10T00:00:00.000Z',
              timeOfDayId: '',
              dayOfWeekId: '',
              authorId: '',
              createdAt: undefined,
              updatedAt: undefined,
              author: {} as User,
              dayOfWeek: { id: '1' } as DayOfWeek,
            },
          ],
          fromDateTime: '2025-03-10T01:45:00.000Z',
          toDateTime: '2025-03-10T04:30:00.000Z',
        }),
      ).toEqual('O');
    });

    it('[from, to] equals 1 of activities.timeOfDay', async () => {
      expect(
        workStatusPolicy.evaluateStatus({
          activities: [
            {
              id: 2,
              requestType: 'Late',
              timeOfDay: {
                fromTime: '01:30:00',
                toTime: '04:30:00',
              } as unknown as TimeOfDay,
              compensatoryDay: '',
              requestChangeDay: '2025-04-10T00:00:00.000Z',
              timeOfDayId: '',
              dayOfWeekId: '',
              authorId: '',
              createdAt: undefined,
              updatedAt: undefined,
              author: {} as User,
              dayOfWeek: { id: '2' } as DayOfWeek,
            },
            {
              id: 3,
              requestType: 'Late',
              timeOfDay: {
                fromTime: '01:30:00',
                toTime: '04:30:00',
              } as unknown as TimeOfDay,
              compensatoryDay: '',
              requestChangeDay: '2025-05-10T00:00:00.000Z',
              timeOfDayId: '',
              dayOfWeekId: '',
              authorId: '',
              createdAt: undefined,
              updatedAt: undefined,
              author: {} as User,
              dayOfWeek: { id: '3' } as DayOfWeek,
            },
            {
              id: 1,
              requestType: 'Late',
              timeOfDay: {
                fromTime: '01:30:00',
                toTime: '04:30:00',
              } as unknown as TimeOfDay,
              compensatoryDay: '',
              requestChangeDay: '2025-03-10T00:00:00.000Z',
              timeOfDayId: '',
              dayOfWeekId: '',
              authorId: '',
              createdAt: undefined,
              updatedAt: undefined,
              author: {} as User,
              dayOfWeek: { id: '1' } as DayOfWeek,
            },
          ],
          fromDateTime: '2025-03-10T01:45:00.000Z',
          toDateTime: '2025-03-10T04:30:00.000Z',
        }),
      ).toEqual('O');
    });
  });

  describe('Registered Late goes late', () => {
    it('[from, to] out of timeOfDay', async () => {
      expect(
        workStatusPolicy.evaluateStatus({
          activities: [
            {
              id: 1,
              requestType: 'Late',
              timeOfDay: {
                fromTime: '01:30:00',
                toTime: '04:30:00',
              } as unknown as TimeOfDay,
              compensatoryDay: '',
              requestChangeDay: '2025-03-10T00:00:00.000Z',
              timeOfDayId: '',
              dayOfWeekId: '',
              authorId: '',
              createdAt: undefined,
              updatedAt: undefined,
              author: {} as User,
              dayOfWeek: { id: '1' } as DayOfWeek,
            },
          ],
          fromDateTime: '2025-03-10T01:46:00.000Z',
          toDateTime: '2025-03-10T04:29:00.000Z',
        }),
      ).toEqual('L');
    });

    it('from < activities.timeOfDay.fromTime', async () => {
      expect(
        workStatusPolicy.evaluateStatus({
          activities: [
            {
              id: 1,
              requestType: 'Late',
              timeOfDay: {
                fromTime: '01:30:00',
                toTime: '04:30:00',
              } as unknown as TimeOfDay,
              compensatoryDay: '',
              requestChangeDay: '2025-03-10T00:00:00.000Z',
              timeOfDayId: '',
              dayOfWeekId: '',
              authorId: '',
              createdAt: undefined,
              updatedAt: undefined,
              author: {} as User,
              dayOfWeek: { id: '1' } as DayOfWeek,
            },
          ],
          fromDateTime: '2025-03-10T01:46:00.000Z',
          toDateTime: '2025-03-10T04:31:00.000Z',
        }),
      ).toEqual('L');
    });

    it('to < activities.timeOfDay.toTime', async () => {
      expect(
        workStatusPolicy.evaluateStatus({
          activities: [
            {
              id: 1,
              requestType: 'Late',
              timeOfDay: {
                fromTime: '01:30:00',
                toTime: '04:30:00',
              } as unknown as TimeOfDay,
              compensatoryDay: '',
              requestChangeDay: '2025-03-10T00:00:00.000Z',
              timeOfDayId: '',
              dayOfWeekId: '',
              authorId: '',
              createdAt: undefined,
              updatedAt: undefined,
              author: {} as User,
              dayOfWeek: { id: '1' } as DayOfWeek,
            },
          ],
          fromDateTime: '2025-03-10T01:44:00.000Z',
          toDateTime: '2025-03-10T04:29:00.000Z',
        }),
      ).toEqual('L');
    });
  });

  describe('Absence and goes on time in compensatory day', () => {
    it('[from, to] inside timeOfDay', async () => {
      expect(
        workStatusPolicy.evaluateStatus({
          activities: [
            {
              id: 1,
              requestType: 'Absence',
              timeOfDay: {
                fromTime: '01:30:00',
                toTime: '04:30:00',
              } as unknown as TimeOfDay,
              compensatoryDay: '2025-03-10T00:00:00.000Z',
              requestChangeDay: '2025-03-10T00:00:00.000Z',
              timeOfDayId: '',
              dayOfWeekId: '',
              authorId: '',
              createdAt: undefined,
              updatedAt: undefined,
              author: {} as User,
              dayOfWeek: { id: '1' } as DayOfWeek,
            },
          ],
          fromDateTime: '2025-03-10T01:29:00.000Z',
          toDateTime: '2025-03-10T04:31:00.000Z',
        }),
      ).toEqual('O');
    });

    it('[from, to] equals timeOfDay', async () => {
      expect(
        workStatusPolicy.evaluateStatus({
          activities: [
            {
              id: 1,
              requestType: 'Absence',
              timeOfDay: {
                fromTime: '01:30:00',
                toTime: '04:30:00',
              } as unknown as TimeOfDay,
              compensatoryDay: '2025-03-10T00:00:00.000Z',
              requestChangeDay: '2025-03-10T00:00:00.000Z',
              timeOfDayId: '',
              dayOfWeekId: '',
              authorId: '',
              createdAt: undefined,
              updatedAt: undefined,
              author: {} as User,
              dayOfWeek: { id: '1' } as DayOfWeek,
            },
          ],
          fromDateTime: '2025-03-10T01:30:00.000Z',
          toDateTime: '2025-03-10T04:30:00.000Z',
        }),
      ).toEqual('O');
    });

    it('[from, to] equals 1 of activities.timeOfDay', async () => {
      expect(
        workStatusPolicy.evaluateStatus({
          activities: [
            {
              id: 2,
              requestType: 'Absence',
              timeOfDay: {
                fromTime: '01:30:00',
                toTime: '04:30:00',
              } as unknown as TimeOfDay,
              compensatoryDay: '2025-03-10T00:00:00.000Z',
              requestChangeDay: '2025-04-10T00:00:00.000Z',
              timeOfDayId: '',
              dayOfWeekId: '',
              authorId: '',
              createdAt: undefined,
              updatedAt: undefined,
              author: {} as User,
              dayOfWeek: { id: '2' } as DayOfWeek,
            },
            {
              id: 3,
              requestType: 'Absence',
              timeOfDay: {
                fromTime: '01:30:00',
                toTime: '04:30:00',
              } as unknown as TimeOfDay,
              compensatoryDay: '2025-03-10T00:00:00.000Z',
              requestChangeDay: '2025-05-10T00:00:00.000Z',
              timeOfDayId: '',
              dayOfWeekId: '',
              authorId: '',
              createdAt: undefined,
              updatedAt: undefined,
              author: {} as User,
              dayOfWeek: { id: '3' } as DayOfWeek,
            },
            {
              id: 1,
              requestType: 'Absence',
              timeOfDay: {
                fromTime: '01:30:00',
                toTime: '04:30:00',
              } as unknown as TimeOfDay,
              compensatoryDay: '2025-03-10T00:00:00.000Z',
              requestChangeDay: '2025-03-10T00:00:00.000Z',
              timeOfDayId: '',
              dayOfWeekId: '',
              authorId: '',
              createdAt: undefined,
              updatedAt: undefined,
              author: {} as User,
              dayOfWeek: { id: '1' } as DayOfWeek,
            },
          ],
          fromDateTime: '2025-03-10T01:30:00.000Z',
          toDateTime: '2025-03-10T04:30:00.000Z',
        }),
      ).toEqual('O');
    });
  });

  describe('Absense and goes late in compensatory day', () => {
    it('[from, to] out of timeOfDay', async () => {
      expect(
        workStatusPolicy.evaluateStatus({
          activities: [
            {
              id: 1,
              requestType: 'Absence',
              timeOfDay: {
                fromTime: '01:30:00',
                toTime: '04:30:00',
              } as unknown as TimeOfDay,
              compensatoryDay: '2025-03-10T00:00:00.000Z',
              requestChangeDay: '2025-03-10T00:00:00.000Z',
              timeOfDayId: '',
              dayOfWeekId: '',
              authorId: '',
              createdAt: undefined,
              updatedAt: undefined,
              author: {} as User,
              dayOfWeek: { id: '1' } as DayOfWeek,
            },
          ],
          fromDateTime: '2025-03-10T01:31:00.000Z',
          toDateTime: '2025-03-10T04:29:00.000Z',
        }),
      ).toEqual('L');
    });

    it('from < activities.timeOfDay.fromTime', async () => {
      expect(
        workStatusPolicy.evaluateStatus({
          activities: [
            {
              id: 1,
              requestType: 'Absence',
              timeOfDay: {
                fromTime: '01:30:00',
                toTime: '04:30:00',
              } as unknown as TimeOfDay,
              compensatoryDay: '2025-03-10T00:00:00.000Z',
              requestChangeDay: '2025-03-10T00:00:00.000Z',
              timeOfDayId: '',
              dayOfWeekId: '',
              authorId: '',
              createdAt: undefined,
              updatedAt: undefined,
              author: {} as User,
              dayOfWeek: { id: '1' } as DayOfWeek,
            },
          ],
          fromDateTime: '2025-03-10T01:46:00.000Z',
          toDateTime: '2025-03-10T04:31:00.000Z',
        }),
      ).toEqual('L');
    });

    it('to < activities.timeOfDay.toTime', async () => {
      expect(
        workStatusPolicy.evaluateStatus({
          activities: [
            {
              id: 1,
              requestType: 'Absence',
              timeOfDay: {
                fromTime: '01:30:00',
                toTime: '04:30:00',
              } as unknown as TimeOfDay,
              compensatoryDay: '2025-03-10T00:00:00.000Z',
              requestChangeDay: '2025-03-10T00:00:00.000Z',
              timeOfDayId: '',
              dayOfWeekId: '',
              authorId: '',
              createdAt: undefined,
              updatedAt: undefined,
              author: {} as User,
              dayOfWeek: { id: '1' } as DayOfWeek,
            },
          ],
          fromDateTime: '2025-03-10T01:44:00.000Z',
          toDateTime: '2025-03-10T04:29:00.000Z',
        }),
      ).toEqual('L');
    });
  });
});
