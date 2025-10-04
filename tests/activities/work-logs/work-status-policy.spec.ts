import { Test } from '@nestjs/testing';
import {
  ActivityMatcher,
  WorkTimeUtils,
} from '../../../src/activities/work-logs/application/work-status-evaluator.service';
import { TimeOfDay } from '../../../src/system/database/entities/time-of-day.entity';
import { DayOfWeek } from '../../../src/system/database/entities/day-of-week.entity';
import { User } from '../../../src/system/database/entities/user.entity';
import { parseISO } from 'date-fns';

describe('WorkStatusPolicy', () => {
  let workStatusPolicy: ActivityMatcher;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [ActivityMatcher],
    }).compile();

    workStatusPolicy = moduleRef.get(ActivityMatcher);
  });

  describe('No activity found and return not finished', () => {
    it('should return not finished', async () => {
      expect(
        workStatusPolicy.match({
          activities: [],
          fromDateTime: '2025-03-10T01:29:00.000Z',
          toDateTime: '2025-03-10T04:31:00.000Z',
        }),
      ).toEqual({
        activityId: null,
        status: 'N',
        auditedFromDateTime: null,
        auditedToDateTime: null,
      });
    });
  });

  describe('Working on time', () => {
    describe('After audit 18-6-2025', () => {
      it('[from, to] inside timeOfDay', async () => {
        expect(
          workStatusPolicy.match({
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
            fromDateTime: '2025-06-23T01:29:00.000Z',
            toDateTime: '2025-06-23T04:31:00.000Z',
          }),
        ).toEqual({
          activityId: 1,
          status: 'O',
          auditedFromDateTime: null,
          auditedToDateTime: null,
        });
      });

      it('[from, to] equals timeOfDay', async () => {
        expect(
          workStatusPolicy.match({
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
            fromDateTime: '2025-06-23T01:30:00.000Z',
            toDateTime: '2025-06-23T04:30:00.000Z',
          }),
        ).toEqual({
          activityId: 1,
          status: 'O',
          auditedFromDateTime: null,
          auditedToDateTime: null,
        });
      });

      it('[from, to] equals timeOfDay from 1 of activities.timeOfDay', async () => {
        expect(
          workStatusPolicy.match({
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
            fromDateTime: '2025-06-23T01:30:00.000Z',
            toDateTime: '2025-06-23T04:30:00.000Z',
          }),
        ).toEqual({
          activityId: 3,
          status: 'O',
          auditedFromDateTime: null,
          auditedToDateTime: null,
        });
      });
    });

    describe('Before audit 18-6-2025, +15min to log', () => {
      it('[from, to] inside timeOfDay', async () => {
        expect(
          workStatusPolicy.match({
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
            fromDateTime: '2025-03-10T01:14:59.000Z',
            toDateTime: '2025-03-10T04:24:00.000Z',
          }),
        ).toEqual({
          activityId: 1,
          status: 'O',
          auditedFromDateTime: parseISO('2025-03-10T01:29:59.000Z'),
          auditedToDateTime: parseISO('2025-03-10T04:39:00.000Z'),
        });
      });

      it('[from, to] equals timeOfDay', async () => {
        expect(
          workStatusPolicy.match({
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
            fromDateTime: '2025-03-10T01:15:00.000Z',
            toDateTime: '2025-03-10T04:15:00.000Z',
          }),
        ).toEqual({
          activityId: 1,
          status: 'O',
          auditedFromDateTime: parseISO('2025-03-10T01:30:00.000Z'),
          auditedToDateTime: parseISO('2025-03-10T04:30:00.000Z'),
        });
      });

      it('[from, to] equals timeOfDay from 1 of activities.timeOfDay', async () => {
        expect(
          workStatusPolicy.match({
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
            fromDateTime: '2025-03-10T01:14:00.000Z',
            toDateTime: '2025-03-10T04:16:00.000Z',
          }),
        ).toEqual({
          activityId: 3,
          status: 'O',
          auditedFromDateTime: parseISO('2025-03-10T01:29:00.000Z'),
          auditedToDateTime: parseISO('2025-03-10T04:31:00.000Z'),
        });
      });
    });
  });

  describe('Working late', () => {
    describe('After audit 18-6-2025', () => {
      it('[from, to] out of timeOfDay', async () => {
        expect(
          workStatusPolicy.match({
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
        ).toEqual({
          activityId: 1,
          status: 'L',
          auditedFromDateTime: parseISO('2025-03-10T01:46:00.000Z'),
          auditedToDateTime: parseISO('2025-03-10T04:44:00.000Z'),
        });
      });

      it('from < activities.timeOfDay.fromTime', async () => {
        expect(
          workStatusPolicy.match({
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
        ).toEqual({
          activityId: 1,
          status: 'L',
          auditedFromDateTime: parseISO('2025-03-10T01:46:00.000Z'),
          auditedToDateTime: parseISO('2025-03-10T04:46:00.000Z'),
        });
      });

      it('to < activities.timeOfDay.toTime', async () => {
        expect(
          workStatusPolicy.match({
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
        ).toEqual({
          activityId: 1,
          status: 'L',
          auditedFromDateTime: parseISO('2025-03-10T01:45:00.000Z'),
          auditedToDateTime: parseISO('2025-03-10T04:44:00.000Z'),
        });
      });
    });

    describe('Before audit 18-6-2025, +15min to log', () => {
      it('[from, to] out of timeOfDay', async () => {
        expect(
          workStatusPolicy.match({
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
            fromDateTime: '2025-03-10T01:16:00.000Z',
            toDateTime: '2025-03-10T04:14:00.000Z',
          }),
        ).toEqual({
          activityId: 1,
          status: 'L',
          auditedFromDateTime: parseISO('2025-03-10T01:31:00.000Z'),
          auditedToDateTime: parseISO('2025-03-10T04:29:00.000Z'),
        });

        // At seconds
        expect(
          workStatusPolicy.match({
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
            fromDateTime: '2025-03-10T01:15:01.000Z',
            toDateTime: '2025-03-10T04:14:00.000Z',
          }),
        ).toEqual({
          activityId: 1,
          status: 'L',
          auditedFromDateTime: parseISO('2025-03-10T01:30:01.000Z'),
          auditedToDateTime: parseISO('2025-03-10T04:29:00.000Z'),
        });
      });

      it('from < activities.timeOfDay.fromTime', async () => {
        expect(
          workStatusPolicy.match({
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
            fromDateTime: '2025-03-10T01:16:00.000Z',
            toDateTime: '2025-03-10T04:31:00.000Z',
          }),
        ).toEqual({
          activityId: 1,
          status: 'L',
          auditedFromDateTime: parseISO('2025-03-10T01:31:00.000Z'),
          auditedToDateTime: parseISO('2025-03-10T04:46:00.000Z'),
        });

        expect(
          workStatusPolicy.match({
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
            fromDateTime: '2025-03-10T01:16:00.000Z',
            toDateTime: '2025-03-10T04:29:59.000Z',
          }),
        ).toEqual({
          activityId: 1,
          status: 'L',
          auditedFromDateTime: parseISO('2025-03-10T01:31:00.000Z'),
          auditedToDateTime: parseISO('2025-03-10T04:44:59.000Z'),
        });
      });

      it('to < activities.timeOfDay.toTime', async () => {
        expect(
          workStatusPolicy.match({
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
            fromDateTime: '2025-03-10T01:15:00.000Z',
            toDateTime: '2025-03-10T04:14:00.000Z',
          }),
        ).toEqual({
          activityId: 1,
          status: 'L',
          auditedFromDateTime: parseISO('2025-03-10T01:30:00.000Z'),
          auditedToDateTime: parseISO('2025-03-10T04:29:00.000Z'),
        });
      });
    });
  });

  describe('Registered Late goes on time', () => {
    it('[from, to] inside timeOfDay', async () => {
      expect(
        workStatusPolicy.match({
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
      ).toEqual({
        activityId: 1,
        status: 'O',
        auditedFromDateTime: parseISO('2025-03-10T01:59:00.000Z'),
        auditedToDateTime: parseISO('2025-03-10T04:46:00.000Z'),
      });
    });

    it('[from, to] equals timeOfDay', async () => {
      expect(
        workStatusPolicy.match({
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
      ).toEqual({
        activityId: 1,
        status: 'O',
        auditedFromDateTime: parseISO('2025-03-10T02:00:00.000Z'),
        auditedToDateTime: parseISO('2025-03-10T04:45:00.000Z'),
      });
    });

    it('[from, to] equals 1 of activities.timeOfDay', async () => {
      expect(
        workStatusPolicy.match({
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
      ).toEqual({
        activityId: 1,
        status: 'O',
        auditedFromDateTime: parseISO('2025-03-10T02:00:00.000Z'),
        auditedToDateTime: parseISO('2025-03-10T04:45:00.000Z'),
      });
    });
  });

  describe('Registered Late goes late', () => {
    it('[from, to] out of timeOfDay', async () => {
      expect(
        workStatusPolicy.match({
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
      ).toEqual({
        activityId: 1,
        status: 'L',
        auditedFromDateTime: parseISO('2025-03-10T02:01:00.000Z'),
        auditedToDateTime: parseISO('2025-03-10T04:44:00.000Z'),
      });
    });

    it('from < activities.timeOfDay.fromTime', async () => {
      expect(
        workStatusPolicy.match({
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
      ).toEqual({
        activityId: 1,
        status: 'L',
        auditedFromDateTime: parseISO('2025-03-10T02:01:00.000Z'),
        auditedToDateTime: parseISO('2025-03-10T04:46:00.000Z'),
      });
    });

    it('to < activities.timeOfDay.toTime', async () => {
      expect(
        workStatusPolicy.match({
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
      ).toEqual({
        activityId: 1,
        status: 'L',
        auditedFromDateTime: parseISO('2025-03-10T01:59:00.000Z'),
        auditedToDateTime: parseISO('2025-03-10T04:44:00.000Z'),
      });
    });
  });

  describe('Absence and goes on time in compensatory day', () => {
    it('[from, to] inside timeOfDay', async () => {
      expect(
        workStatusPolicy.match({
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
      ).toEqual({
        activityId: 1,
        status: 'O',
        auditedFromDateTime: parseISO('2025-03-10T01:44:00.000Z'),
        auditedToDateTime: parseISO('2025-03-10T04:46:00.000Z'),
      });
    });

    it('[from, to] equals timeOfDay', async () => {
      expect(
        workStatusPolicy.match({
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
      ).toEqual({
        activityId: 1,
        status: 'O',
        auditedFromDateTime: parseISO('2025-03-10T01:45:00.000Z'),
        auditedToDateTime: parseISO('2025-03-10T04:45:00.000Z'),
      });
    });

    it('[from, to] equals 1 of activities.timeOfDay', async () => {
      expect(
        workStatusPolicy.match({
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
      ).toEqual({
        activityId: 2,
        status: 'O',
        auditedFromDateTime: parseISO('2025-03-10T01:45:00.000Z'),
        auditedToDateTime: parseISO('2025-03-10T04:45:00.000Z'),
      });
    });
  });

  describe('Absense and goes late in compensatory day', () => {
    it('[from, to] out of timeOfDay', async () => {
      expect(
        workStatusPolicy.match({
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
      ).toEqual({
        activityId: 1,
        status: 'L',
        auditedFromDateTime: parseISO('2025-03-10T01:46:00.000Z'),
        auditedToDateTime: parseISO('2025-03-10T04:44:00.000Z'),
      });
    });

    it('from < activities.timeOfDay.fromTime', async () => {
      expect(
        workStatusPolicy.match({
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
      ).toEqual({
        activityId: 1,
        status: 'L',
        auditedFromDateTime: parseISO('2025-03-10T02:01:00.000Z'),
        auditedToDateTime: parseISO('2025-03-10T04:46:00.000Z'),
      });
    });

    it('to < activities.timeOfDay.toTime', async () => {
      expect(
        workStatusPolicy.match({
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
      ).toEqual({
        activityId: 1,
        status: 'L',
        auditedFromDateTime: parseISO('2025-03-10T01:59:00.000Z'),
        auditedToDateTime: parseISO('2025-03-10T04:44:00.000Z'),
      });
    });
  });
});

describe('WorkTimeUtils', () => {
  it('should interval bounded when fully equals', () => {
    expect(
      WorkTimeUtils.areIntervalsBounded(
        [new Date(), new Date()],
        [new Date(), new Date()],
      ),
    ).toBeTruthy();
  });

  it('should small bounded by smaller edges', () => {
    expect(
      WorkTimeUtils.areIntervalsBounded(
        // Registered time interval
        [
          new Date('2025-01-01T01:30:00.000Z'),
          new Date('2025-01-01T04:30:00.000Z'),
        ],
        // Work logs
        [
          new Date('2025-01-01T01:29:00.000Z'),
          new Date('2025-01-01T04:31:00.000Z'),
        ],
      ),
    ).toBeTruthy();
  });

  it('should small bounded by smaller comebine with equals edges', () => {
    expect(
      WorkTimeUtils.areIntervalsBounded(
        // Registered time interval
        [
          new Date('2025-01-01T01:30:00.000Z'),
          new Date('2025-01-01T04:30:00.000Z'),
        ],
        // Work logs
        [
          new Date('2025-01-01T01:30:00.000Z'),
          new Date('2025-01-01T04:31:00.000Z'),
        ],
      ),
    ).toBeTruthy();
  });

  it('should false when 1 of edges out of interval', () => {
    expect(
      WorkTimeUtils.areIntervalsBounded(
        // Registered time interval
        [
          new Date('2025-01-01T01:30:00.000Z'),
          new Date('2025-01-01T04:30:00.000Z'),
        ],
        // Work logs
        [
          new Date('2025-01-01T01:31:00.000Z'), // False
          new Date('2025-01-01T04:31:00.000Z'),
        ],
      ),
    ).toBeFalsy();

    expect(
      WorkTimeUtils.areIntervalsBounded(
        // Registered time interval
        [
          new Date('2025-01-01T01:30:00.000Z'),
          new Date('2025-01-01T04:30:00.000Z'),
        ],
        // Work logs
        [
          new Date('2025-01-01T01:30:00.000Z'), // False
          new Date('2025-01-01T04:29:00.000Z'),
        ],
      ),
    ).toBeFalsy();
  });
});
