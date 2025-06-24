import { Test, TestingModule } from '@nestjs/testing';
import { ActivityController } from 'src/activities/managements/activity.controller';
import {
  ActivityService,
  ActivityServiceToken,
} from '../../../src/activities/managements/interfaces/activity.service';
import { FindActivitiesRequest } from '../../../src/activities/managements/dtos/presentation/find-activities.request';
import { FindActivitiesResponseDTO } from '../../../src/activities/managements/dtos/core/find-activities.dto';

describe(ActivityController.name, () => {
  let activityController: ActivityController;
  let activityService: ActivityService;

  beforeEach(async () => {
    const activityServiceMock = {
      findActivities: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActivityController],
      providers: [
        {
          provide: ActivityServiceToken,
          useValue: activityServiceMock,
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
});
