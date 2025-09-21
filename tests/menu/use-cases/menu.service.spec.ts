import { Test, TestingModule } from '@nestjs/testing';
import { MenuServiceImpl } from '../../../src/menu/use-cases/menu.service';
import { RoleService } from '../../../src/account-service/authorization/interfaces/role-service.interface';
import { MenuRepository } from '../../../src/menu/domain/repositories/menu.repository.interface';
import { MenuAggregate } from '../../../src/menu/domain/aggregates/menu.aggregate';

describe('MenuServiceImpl', () => {
  let service: MenuServiceImpl;
  let menuRepository: jest.Mocked<MenuRepository>;
  let roleService: jest.Mocked<RoleService>;

  beforeEach(async () => {
    // Arrange
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenuServiceImpl,
        {
          provide: MenuRepository,
          useValue: {
            findByGrantedAccessCodes: jest.fn(),
          },
        },
        {
          provide: RoleService,
          useValue: {
            findPermissionsByUserId: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MenuServiceImpl>(MenuServiceImpl);
    menuRepository = module.get(MenuRepository);
    roleService = module.get(RoleService);
  });

  describe('findMenusByUserId', () => {
    it('should return [] when no permissions are found', async () => {
      // Arrange
      const userId = 'user-123';
      roleService.findPermissionsByUserId.mockResolvedValue([]);

      // Act
      const result = await service.findMenusByUserId(userId);

      // Assert
      expect(roleService.findPermissionsByUserId).toHaveBeenCalledWith(userId);
      expect(menuRepository.findByGrantedAccessCodes).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should return menus when permissions are found', async () => {
      // Arrange
      const userId = 'user-123';
      const permissions = ['PERM_READ', 'PERM_WRITE'];
      const expectedMenus = [
        { id: '1', name: 'Dashboard', subMenus: [], parent: null },
      ] as unknown as MenuAggregate[];
      roleService.findPermissionsByUserId.mockResolvedValue(permissions);
      menuRepository.findByGrantedAccessCodes.mockResolvedValue(expectedMenus);

      // Act
      const result = await service.findMenusByUserId(userId);

      // Assert
      expect(roleService.findPermissionsByUserId).toHaveBeenCalledWith(userId);
      expect(menuRepository.findByGrantedAccessCodes).toHaveBeenCalledWith(
        permissions,
      );
      expect(result).toEqual(expectedMenus);
    });
  });
});
