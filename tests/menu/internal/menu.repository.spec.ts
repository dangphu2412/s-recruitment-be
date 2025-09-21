import { MenuRepository } from '../../../src/menu/internal/menu.repositoryt';
import { Menu } from '../../../src/system/database/entities/menu.entity';

describe('MenuRepository', () => {
  let repository: MenuRepository;

  beforeEach(() => {
    // Arrange
    repository = new MenuRepository({} as any); // bypass ctor deps
    repository.findTrees = jest.fn(); // mock the inherited findTrees
  });

  describe('findByPermissionCodes', () => {
    it('should return only menus with matching permission codes', async () => {
      // Arrange
      const mockPermissions = ['PERM_READ'];
      const trees: Menu[] = [
        {
          id: 1,
          name: 'Dashboard',
          subMenus: [
            {
              id: 2,
              name: 'Submenu 1',
              permissionSettings: [{ code: 'PERM_READ' }],
            } as any,
            {
              id: 3,
              name: 'Submenu 2',
              permissionSettings: [{ code: 'PERM_WRITE' }],
            } as any,
          ],
          permissionSettings: [],
        } as any,
        {
          id: 4,
          name: 'Reports',
          subMenus: [
            {
              id: 5,
              name: 'Submenu 3',
              permissionSettings: [{ code: 'PERM_ADMIN' }],
            } as any,
          ],
          permissionSettings: [],
        } as any,
      ];

      (repository.findTrees as jest.Mock).mockResolvedValue(trees);

      // Act
      const result = await repository.findByPermissionCodes(mockPermissions);

      // Assert
      expect(repository.findTrees).toHaveBeenCalledWith({
        relations: ['permissionSettings'],
      });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
      expect(result[0].subMenus).toHaveLength(1);
      expect(result[0].subMenus[0].id).toBe(2);
    });

    it('should return [] when no matching permissions found', async () => {
      // Arrange
      const mockPermissions = ['PERM_NOT_EXIST'];
      const trees: Menu[] = [
        {
          id: 1,
          name: 'Dashboard',
          subMenus: [
            {
              id: 2,
              name: 'Submenu 1',
              permissionSettings: [{ code: 'PERM_READ' }],
            } as any,
          ],
          permissionSettings: [],
        } as any,
      ];
      (repository.findTrees as jest.Mock).mockResolvedValue(trees);

      // Act
      const result = await repository.findByPermissionCodes(mockPermissions);

      // Assert
      expect(result).toEqual([]);
    });
  });
});
