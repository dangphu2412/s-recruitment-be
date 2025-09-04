import { Test, TestingModule } from '@nestjs/testing';
import { MenuServiceImpl } from '../../../src/menu/internal/menu.service';
import { MenuRepository } from '../../../src/menu/internal/menu.repositoryt';
import {
  RoleService,
  RoleServiceToken,
} from '../../../src/account-service/authorization/interfaces/role-service.interface';
import { Menu } from '../../../src/menu';

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
            findByPermissionCodes: jest.fn(),
          },
        },
        {
          provide: RoleServiceToken,
          useValue: {
            findPermissionsByUserId: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MenuServiceImpl>(MenuServiceImpl);
    menuRepository = module.get(MenuRepository);
    roleService = module.get(RoleServiceToken);
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
      expect(menuRepository.findByPermissionCodes).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should return menus when permissions are found', async () => {
      // Arrange
      const userId = 'user-123';
      const permissions = ['PERM_READ', 'PERM_WRITE'];
      const expectedMenus: Menu[] = [
        { id: '1', name: 'Dashboard', subMenus: [], parent: null },
      ];
      roleService.findPermissionsByUserId.mockResolvedValue(permissions);
      menuRepository.findByPermissionCodes.mockResolvedValue(expectedMenus);

      // Act
      const result = await service.findMenusByUserId(userId);

      // Assert
      expect(roleService.findPermissionsByUserId).toHaveBeenCalledWith(userId);
      expect(menuRepository.findByPermissionCodes).toHaveBeenCalledWith(
        permissions,
      );
      expect(result).toEqual(expectedMenus);
    });
  });
});
