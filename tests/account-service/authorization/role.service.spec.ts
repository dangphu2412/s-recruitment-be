import { Cache } from 'cache-manager';
import { Repository } from 'typeorm';
import ms from 'ms';
import { RoleServiceImpl } from '../../../src/account-service/authorization/services/role.service';
import { RoleRepository } from '../../../src/account-service/authorization/repositories/role.repository';
import { Permission } from '../../../src/account-service/domain/data-access/entities/permission.entity';
import { EnvironmentKeyFactory } from '../../../src/system/services';
import { Role } from '../../../src/account-service/domain/data-access/entities/role.entity';
import { InvalidRoleUpdateException } from '../../../src/account-service/domain/core/exceptions';
import { AccessControlList } from '../../../src/account-service/authorization/dtos/aggregates/access-control-list.aggregate';

jest.mock('ms');

describe('RoleServiceImpl', () => {
  let roleService: RoleServiceImpl;
  let roleRepository: jest.Mocked<RoleRepository>;
  let permissionRepository: jest.Mocked<Repository<Permission>>;
  let cacheManager: jest.Mocked<Cache>;
  let environmentKeyFactory: jest.Mocked<EnvironmentKeyFactory>;

  beforeEach(() => {
    roleRepository = {
      findOne: jest.fn(),
      findAccessControlList: jest.fn(),
      save: jest.fn(),
      findBy: jest.fn(),
      find: jest.fn(),
    } as any;

    permissionRepository = {
      find: jest.fn(),
    } as any;

    cacheManager = {
      get: jest.fn(),
      set: jest.fn(),
      store: {
        del: jest.fn(),
      },
    } as any;

    environmentKeyFactory = {
      getRefreshTokenExpiration: jest.fn().mockReturnValue('7d'),
    } as any;

    (ms as any).mockReturnValue(604800000); // 7 days in ms

    roleService = new RoleServiceImpl(
      roleRepository,
      permissionRepository,
      cacheManager,
      environmentKeyFactory,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByName', () => {
    it('should call roleRepository.findOne', async () => {
      const mockRole = { id: '1', name: 'Admin' } as Role;
      roleRepository.findOne.mockResolvedValue(mockRole);

      const result = await roleService.findByName('Admin');

      expect(roleRepository.findOne).toHaveBeenCalledWith({
        where: { name: 'Admin' },
      });
      expect(result).toEqual(mockRole);
    });
  });

  describe('findAccessControlView', () => {
    it('should return roles with permission matrix', async () => {
      const mockRoles = [
        {
          id: 1,
          name: 'Admin',
          description: 'Admin role',
          isEditable: true,
          permissions: [{ id: 'p1' }] as Permission[],
        } as any,
      ] as AccessControlList;

      const mockPermissions = [
        { id: 'p1', name: 'read' },
        { id: 'p2', name: 'write' },
      ] as Permission[];

      roleRepository.findAccessControlList.mockResolvedValue(mockRoles);
      permissionRepository.find.mockResolvedValue(mockPermissions);

      const result = await roleService.findAccessControlView();

      expect(result.access.length).toBe(1);
      expect(result.access[0].rights.length).toBe(2);
      expect(result.access[0].rights[0]).toHaveProperty('canAccess');
    });
  });

  describe('updateRole', () => {
    it('should throw InvalidRoleUpdateException for invalid role or permissions', async () => {
      roleRepository.findOne.mockResolvedValue({
        id: 1,
        isEditable: false,
        users: [],
      } as any);

      permissionRepository.find.mockResolvedValue([]);

      await expect(
        roleService.updateRole('role-1', { rights: [1, 2] }),
      ).rejects.toThrow(InvalidRoleUpdateException);
    });

    it('should update role permissions and clear related cache', async () => {
      const mockRole = {
        id: 'role-1',
        isEditable: true,
        users: [{ id: 'user-1' }],
        permissions: [],
      } as Role;

      roleRepository.findOne.mockResolvedValue(mockRole);
      permissionRepository.find.mockResolvedValue([
        { id: 'p1' } as Permission,
        { id: 'p2' } as Permission,
      ]);

      await roleService.updateRole('role-1', { rights: [1, 2] });

      expect(roleRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'role-1' }),
      );
      expect(cacheManager.store.del).toHaveBeenCalledWith(['RK-user-1']);
    });
  });

  describe('findAccessRightsByUserId', () => {
    it('should return cached rights if available', async () => {
      cacheManager.get.mockResolvedValue(['read', 'write']);
      const result = await roleService.findAccessRightsByUserId('user-1');

      expect(result).toEqual(['read', 'write']);
      expect(roleRepository.find).not.toHaveBeenCalled();
    });

    it('should query roles and cache rights if not cached', async () => {
      cacheManager.get.mockResolvedValue(undefined);
      roleRepository.find.mockResolvedValue([
        {
          permissions: [{ name: 'read' }, { name: 'write' }],
        } as Role,
      ]);

      await roleService.findAccessRightsByUserId('user-1');

      expect(roleRepository.find).toHaveBeenCalled();
      expect(cacheManager.set).toHaveBeenCalled();
    });
  });

  describe('clean', () => {
    it('should delete single user cache key', async () => {
      await roleService.clean('user-1');
      expect(cacheManager.store.del).toHaveBeenCalledWith(['RK-user-1']);
    });

    it('should delete multiple user cache keys', async () => {
      await roleService.clean(['user-1', 'user-2']);
      expect(cacheManager.store.del).toHaveBeenCalledWith([
        'RK-user-1',
        'RK-user-2',
      ]);
    });
  });
});
