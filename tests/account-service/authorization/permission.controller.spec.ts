import { Test, TestingModule } from '@nestjs/testing';
import { PermissionController } from '../../../src/account-service/authorization/controllers/permissions.controller';
import { PermissionService } from '../../../src/account-service/authorization/interfaces/permission-service.interface';
import { Permission } from '../../../src/system/database/entities/permission.entity';

describe('PermissionController', () => {
  let controller: PermissionController;
  let permissionService: PermissionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermissionController],
      providers: [
        {
          provide: PermissionService,
          useValue: {
            findAll: jest.fn(),
            findMy: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PermissionController>(PermissionController);
    permissionService = module.get<PermissionService>(PermissionService);
  });

  describe('findAll', () => {
    it('should return all permissions', async () => {
      const expected = [{ id: 'p1' }, { id: 'p2' }] as Permission[];
      jest.spyOn(permissionService, 'findAll').mockResolvedValue(expected);

      const result = await controller.findAll();

      expect(permissionService.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expected);
    });
  });

  describe('findMy', () => {
    it('should return permissions for a specific user', async () => {
      const userId = 'user-123';
      const expected = [{ id: 'p3' }] as Permission[];
      jest.spyOn(permissionService, 'findMy').mockResolvedValue(expected);

      const result = await controller.findMy(userId);

      expect(permissionService.findMy).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expected);
    });
  });
});
