import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, TreeRepository } from 'typeorm';
import { MenuRepositoryImpl } from '../../../src/menu/infras/menu.repository';
import { Menu } from '../../../src/system/database/entities/menu.entity';
import { MenuAggregate } from '../../../src/menu/domain/aggregates/menu.aggregate';

describe('MenuRepositoryImpl', () => {
  let repository: MenuRepositoryImpl;
  let dataSource: jest.Mocked<DataSource>;
  let treeRepository: jest.Mocked<TreeRepository<Menu>>;

  beforeEach(async () => {
    // Arrange: mock dependencies
    treeRepository = {
      findTrees: jest.fn(),
    } as unknown as jest.Mocked<TreeRepository<Menu>>;

    dataSource = {
      getTreeRepository: jest.fn().mockReturnValue(treeRepository),
    } as unknown as jest.Mocked<DataSource>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenuRepositoryImpl,
        {
          provide: DataSource,
          useValue: dataSource,
        },
      ],
    }).compile();

    repository = module.get<MenuRepositoryImpl>(MenuRepositoryImpl);
  });

  describe('findByGrantedAccessCodes', () => {
    it('should return menus with granted permissions only', async () => {
      // Arrange
      const permissionIds = ['PERM_1', 'PERM_2'];

      const menuEntity: Menu = {
        id: '1',
        name: 'Dashboard',
        iconCode: 'home',
        accessLink: '/dashboard',
        permissionSettings: [{ code: 'PERM_1' }],
        subMenus: [
          {
            id: '2',
            name: 'Reports',
            iconCode: 'report',
            accessLink: '/reports',
            permissionSettings: [{ code: 'PERM_2' }],
            subMenus: [],
          } as Menu,
        ],
      } as Menu;

      treeRepository.findTrees.mockResolvedValue([menuEntity]);

      // Act
      const result = await repository.findByGrantedAccessCodes(permissionIds);

      // Assert
      expect(treeRepository.findTrees).toHaveBeenCalledWith({
        relations: ['permissionSettings'],
      });
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(MenuAggregate);
      expect(result[0].subMenus).toHaveLength(1);
      expect(result[0].subMenus[0].name).toBe('Reports');
    });

    it('should filter out menus without granted permissions', async () => {
      // Arrange
      const permissionIds = ['PERM_999'];
      const menuEntity: Menu = {
        id: '1',
        name: 'Dashboard',
        iconCode: 'home',
        accessLink: '/dashboard',
        permissionSettings: [{ code: 'PERM_NOPE' }],
        subMenus: [],
      } as Menu;

      treeRepository.findTrees.mockResolvedValue([menuEntity]);

      // Act
      const result = await repository.findByGrantedAccessCodes(permissionIds);

      // Assert
      expect(result).toHaveLength(0);
    });
  });

  describe('fromEntityToDomain', () => {
    it('should map entity to domain aggregate correctly', () => {
      // Arrange
      const entity: Menu = {
        id: '1',
        name: 'Settings',
        iconCode: 'gear',
        accessLink: '/settings',
        subMenus: [],
      } as Menu;

      // Act
      const aggregate = MenuRepositoryImpl.fromEntityToDomain(entity);

      // Assert
      expect(aggregate).toBeInstanceOf(MenuAggregate);
      expect(aggregate.id).toBe(entity.id);
      expect(aggregate.name).toBe(entity.name);
      expect(aggregate.iconCode).toBe(entity.iconCode);
      expect(aggregate.accessLink).toBe(entity.accessLink);
      expect(aggregate.subMenus).toEqual([]);
    });
  });
});
