import { Test, TestingModule } from '@nestjs/testing';
import { ActivityController } from 'src/activities/managements/activity.controller';
import {
  ActivityService,
  ActivityServiceToken,
} from '../../../src/activities/managements/interfaces/activity.service';
import { FindActivitiesRequest } from '../../../src/activities/managements/dtos/presentation/find-activities.request';
import { FindActivitiesResponseDTO } from '../../../src/activities/managements/dtos/core/find-activities.dto';
import { SearchMyActivitiesRequest } from '../../../src/activities/managements/dtos/presentation/search-my-activities.request';

describe(ActivityController.name, () => {
  let activityController: ActivityController;
  let activityService: ActivityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActivityController],
      providers: [
        {
          provide: ActivityServiceToken,
          useValue: {
            findActivities: jest.fn(),
            searchMy: jest.fn(),
          },
        },
      ],
    }).compile();

    activityController = module.get<ActivityController>(ActivityController);
    activityService = module.get<ActivityService>(ActivityServiceToken);
  });

  it('should be defined', () => {
    expect(activityController).toBeDefined();
  });

  it('should call activityService.findActivities with the correct parameters', async () => {
    const query: FindActivitiesRequest = {
      fromDate: '2021-01-01',
      toDate: '2021-01-31',
    };
    const expectedResult = [
      { id: 1, requestType: 'requestType' },
    ] as FindActivitiesResponseDTO;

    jest
      .spyOn(activityService, 'findActivities')
      .mockResolvedValue(expectedResult);

    const result = await activityController.findActivities(query);

    expect(activityService.findActivities).toHaveBeenCalledWith(query);
    expect(result).toEqual(expectedResult);
  });

  it('should call activityService.searchMy with the correct parameters', async () => {
    const query: SearchMyActivitiesRequest = {};
    const expectedResult = [
      { id: 1, requestType: 'requestType' },
    ] as FindActivitiesResponseDTO;

    jest.spyOn(activityService, 'searchMy').mockResolvedValue(expectedResult);

    const result = await activityController.searchMy(query, 'userId');

    expect(activityService.searchMy).toHaveBeenCalledWith({
      ...query,
      userId: 'userId',
    });
    expect(result).toEqual(expectedResult);
  });
});
