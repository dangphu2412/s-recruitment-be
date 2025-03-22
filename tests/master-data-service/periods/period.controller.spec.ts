import { Test, TestingModule } from '@nestjs/testing';
import {
  PeriodController,
  PeriodCRUDService,
} from '../../../src/master-data-service/periods/period.controller';
import { ResourceCRUDService } from '../../../src/system/resource-templates/resource-service-template';
import { Period } from '../../../src/master-data-service/periods/period.entity';

describe('PeriodController', () => {
  let controller: PeriodController;
  let service: jest.Mocked<ResourceCRUDService<Period>>;

  beforeEach(async () => {
    const mockService: Partial<jest.Mocked<ResourceCRUDService<Period>>> = {
      find: jest.fn(),
      createOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PeriodController],
      providers: [
        {
          provide: PeriodCRUDService.token,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<PeriodController>(PeriodController);
    service = module.get(PeriodCRUDService.token);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('find', () => {
    it('should call periodService.find and return result', async () => {
      const mockResult = [
        { id: 1, name: 'Q1' },
        { id: 2, name: 'Q2' },
      ];
      service.find.mockResolvedValue(mockResult as any);

      const result = await controller.find();

      expect(service.find).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });
  });

  describe('createOne', () => {
    it('should call periodService.createOne with DTO and return result', async () => {
      const dto = { name: 'Q3', description: 'Third Quarter' };
      const mockCreated = { id: 3, ...dto };
      service.createOne.mockResolvedValue(mockCreated as any);

      const result = await controller.createOne(dto);

      expect(service.createOne).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockCreated);
    });
  });
});
