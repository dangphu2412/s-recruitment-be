import { Test, TestingModule } from '@nestjs/testing';
import {
  DepartmentCRUDService,
  DepartmentsController,
} from '../../../src/master-data-service/departments/departments.controller';
import { ResourceCRUDService } from '../../../src/system/resource-templates/resource-service-template';
import { Department } from '../../../src/master-data-service/departments/department.entity';

describe('DepartmentsController', () => {
  let controller: DepartmentsController;
  let service: jest.Mocked<ResourceCRUDService<Department>>;

  beforeEach(async () => {
    const mockService: Partial<jest.Mocked<ResourceCRUDService<Department>>> = {
      find: jest.fn(),
      createOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DepartmentsController],
      providers: [
        {
          provide: DepartmentCRUDService.token,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<DepartmentsController>(DepartmentsController);
    service = module.get(DepartmentCRUDService.token);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('find', () => {
    it('should call departmentService.find and return result', async () => {
      const mockDepartments = [
        { id: 'd1', name: 'HR' },
        { id: 'd2', name: 'IT' },
      ];
      service.find.mockResolvedValue(mockDepartments as any);

      const result = await controller.find();

      expect(service.find).toHaveBeenCalled();
      expect(result).toEqual(mockDepartments);
    });
  });

  describe('createOne', () => {
    it('should call departmentService.createOne with DTO and return result', async () => {
      const dto = { id: 'd3', name: 'Finance', description: 'Finance Dept' };
      const mockDepartment = { ...dto };
      service.createOne.mockResolvedValue(mockDepartment as any);

      const result = await controller.createOne(dto);

      expect(service.createOne).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockDepartment);
    });
  });
});
