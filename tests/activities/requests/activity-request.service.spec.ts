import { Test, TestingModule } from '@nestjs/testing';
import {
  ActivityRequestService,
  ActivityRequestServiceToken,
} from '../../../src/activities/domain/core/services/activity-request.service';
import { ActivityRequestServiceImpl } from '../../../src/activities/requests/activity-request.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ActivityRequest } from '../../../src/activities/domain/data-access/activity-request.entity';
import { ActivityServiceToken } from '../../../src/activities/domain/core/services/activity.service';
import { UserServiceToken } from '../../../src/account-service/management/interfaces/user-service.interface';

describe(ActivityRequestServiceImpl.name, () => {
  let service: ActivityRequestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ActivityRequestServiceToken,
          useValue: ActivityRequestServiceImpl,
        },
        {
          provide: getRepositoryToken(ActivityRequest),
          useValue: {},
        },
        {
          provide: ActivityServiceToken,
          useValue: {},
        },
        {
          provide: UserServiceToken,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<ActivityRequestService>(ActivityRequestServiceToken);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Test create activity request by sheet', () => {
    it('Should return an empty request', async () => {
      expect(
        ActivityRequestServiceImpl.createUserActivityRequestByRow([]),
      ).toEqual({
        name: undefined,
        activitySheetRequests: [],
      });
    });

    it('Should return an monday request', async () => {
      expect(
        ActivityRequestServiceImpl.createUserActivityRequestByRow([
          '',
          'Name',
          '',
          'x',
        ]),
      ).toEqual({
        name: 'Name',
        activitySheetRequests: [
          {
            dayOfWeekId: 1, // Monday
            timeOfDayId: 'SUM-MORN',
          },
        ],
      });
    });

    it('Should return an sunday request', async () => {
      expect(
        ActivityRequestServiceImpl.createUserActivityRequestByRow([
          '',
          'Name',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          'x',
          '',
          '',
        ]),
      ).toEqual({
        name: 'Name',
        activitySheetRequests: [
          {
            dayOfWeekId: 0, // Sunday
            timeOfDayId: 'SUM-MORN',
          },
        ],
      });
    });

    it('Should return an monday request ignore case x or X', async () => {
      expect(
        ActivityRequestServiceImpl.createUserActivityRequestByRow([
          '',
          'Name',
          '',
          'X',
        ]),
      ).toEqual({
        name: 'Name',
        activitySheetRequests: [
          {
            dayOfWeekId: 1, // Monday
            timeOfDayId: 'SUM-MORN',
          },
        ],
      });
    });

    it('Should return an request in afternoon', async () => {
      expect(
        ActivityRequestServiceImpl.createUserActivityRequestByRow([
          '',
          'Name',
          '',
          '',
          'X',
        ]),
      ).toEqual({
        name: 'Name',
        activitySheetRequests: [
          {
            dayOfWeekId: 1, // Monday
            timeOfDayId: 'SUM-AFT',
          },
        ],
      });

      expect(
        ActivityRequestServiceImpl.createUserActivityRequestByRow([
          '',
          'Name',
          '',
          '',
          '',
          '',
          '',
          'x',
          '',
        ]),
      ).toEqual({
        name: 'Name',
        activitySheetRequests: [
          {
            dayOfWeekId: 2, // Monday
            timeOfDayId: 'SUM-AFT',
          },
        ],
      });
    });

    it('Should return monday morning request, tuesday afternoon request and wednesday evening', () => {
      expect(
        ActivityRequestServiceImpl.createUserActivityRequestByRow([
          '',
          'Name',
          '',
          'x',
          '',
          '',
          '',
          'x',
          '',
          '',
          '',
          'x',
        ]),
      ).toEqual({
        name: 'Name',
        activitySheetRequests: [
          {
            dayOfWeekId: 1,
            timeOfDayId: 'SUM-MORN',
          },
          {
            dayOfWeekId: 2,
            timeOfDayId: 'SUM-AFT',
          },
          {
            dayOfWeekId: 3,
            timeOfDayId: 'SUM-EVN',
          },
        ],
      });
    });
  });
});
