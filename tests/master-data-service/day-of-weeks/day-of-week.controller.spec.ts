import { Test, TestingModule } from '@nestjs/testing';
import {
  DayOfWeekCRUDServiceContainer,
  DayOfWeeksController,
} from '../../../src/master-data-service/day-of-weeks/day-of-weeks.controller';
import { ResourceCRUDService } from '../../../src/system/resource-templates/resource-service-template';
import { DayOfWeek } from '../../../src/system/database/entities/day-of-week';

describe('DayOfWeeksController', () => {
  let controller: DayOfWeeksController;
  let service: jest.Mocked<ResourceCRUDService<DayOfWeek>>;

  beforeEach(async () => {
    const mockService: Partial<jest.Mocked<ResourceCRUDService<DayOfWeek>>> = {
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DayOfWeeksController],
      providers: [
        {
          provide: DayOfWeekCRUDServiceContainer.token,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<DayOfWeeksController>(DayOfWeeksController);
    service = module.get(DayOfWeekCRUDServiceContainer.token);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('find', () => {
    it('should call dayResourceCRUDService.find and return result', async () => {
      const mockDays = [
        { id: 1, name: 'Monday' },
        { id: 2, name: 'Tuesday' },
      ];
      service.find.mockResolvedValue(mockDays as any);

      const result = await controller.find();

      expect(service.find).toHaveBeenCalled();
      expect(result).toEqual(mockDays);
    });
  });
});
