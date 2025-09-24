import { Test, TestingModule } from '@nestjs/testing';
import {
  TimeOfDayCRUDService,
  TimeOfDaysController,
} from '../../../src/master-data-service/time-of-days/time-of-days.controller';
import { ResourceCRUDService } from '../../../src/system/resource-templates/resource-service-template';
import { TimeOfDay } from '../../../src/system/database/entities/time-of-day.entity';

describe('TimeOfDaysController', () => {
  let controller: TimeOfDaysController;
  let service: jest.Mocked<ResourceCRUDService<TimeOfDay>>;

  beforeEach(async () => {
    const mockService: Partial<jest.Mocked<ResourceCRUDService<TimeOfDay>>> = {
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TimeOfDaysController],
      providers: [
        {
          provide: TimeOfDayCRUDService.token,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<TimeOfDaysController>(TimeOfDaysController);
    service = module.get(TimeOfDayCRUDService.token);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('find', () => {
    it('should call timeOfDayService.find and return result', async () => {
      const mockResult = [
        { id: 1, name: 'Morning' },
        { id: 2, name: 'Evening' },
      ];
      service.find.mockResolvedValue(mockResult as any);

      const result = await controller.find();

      expect(service.find).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });
  });
});
