import { Test, TestingModule } from '@nestjs/testing';
import { ActivityServiceImpl } from '../../../src/activities/managements/activity.service';
import { ActivityRepository } from '../../../src/activities/managements/activity.repository';
import { FindActivitiesDTO } from '../../../src/activities/domain/core/dtos/find-activities.dto';
import { CreateActivityDTO } from '../../../src/activities/domain/core/dtos/create-activity.dto';
import { Activity } from '../../../src/activities/domain/data-access/activity.entity';

describe(ActivityServiceImpl.name, () => {
  let activityService: ActivityServiceImpl;
  let activityRepository: ActivityRepository;

  beforeEach(async () => {
    const activityRepositoryMock = {
      findActivities: jest.fn(),
      insert: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivityServiceImpl,
        {
          provide: ActivityRepository,
          useValue: activityRepositoryMock,
        },
      ],
    }).compile();

    activityService = module.get<ActivityServiceImpl>(ActivityServiceImpl);
    activityRepository = module.get<ActivityRepository>(ActivityRepository);
  });

  it('should be defined', () => {
    expect(activityService).toBeDefined();
  });

  describe('findActivities', () => {
    it('should call activityRepository.findActivities with correct parameters', async () => {
      const dto: FindActivitiesDTO = {
        fromDate: '2021-01-01',
        toDate: '2021-01-31',
      };
      const expectedResponse: Activity[] = [{ id: 1 }] as Activity[];

      jest
        .spyOn(activityRepository, 'findActivities')
        .mockResolvedValue(expectedResponse);

      const result = await activityService.findActivities(dto);

      expect(activityRepository.findActivities).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('createActivity', () => {
    it('should call activityRepository.insert with correct parameters', async () => {
      const dto: CreateActivityDTO = {
        authorId: 'test',
        requestType: 'test',
        timeOfDayId: 'test',
        dayOfWeekId: 'test',
      };

      await activityService.createActivity(dto);

      expect(activityRepository.insert).toHaveBeenCalledWith(dto);
    });
  });
});
