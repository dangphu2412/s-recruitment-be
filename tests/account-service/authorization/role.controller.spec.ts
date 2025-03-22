import { RoleController } from '../../../src/account-service/authorization/controllers/role.controller';
import { RoleService } from '../../../src/account-service/domain/core/services/role.service';
import { UpdateRoleRequestDto } from '../../../src/account-service/management/controllers/update-role-request.dto';
import { AccessControlView } from '../../../src/account-service/authorization/dtos/core/role-list.dto';

describe('RoleController', () => {
  let roleController: RoleController;
  let roleService: jest.Mocked<RoleService>;

  beforeEach(() => {
    roleService = {
      findAccessControlView: jest.fn(),
      updateRole: jest.fn(),
    } as any;

    roleController = new RoleController(roleService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getRoles', () => {
    it('should call roleService.findAccessControlView and return result', async () => {
      const mockRoles = {
        access: [{ id: '1', name: 'Admin' }],
      } as AccessControlView;
      roleService.findAccessControlView.mockResolvedValue(mockRoles);

      const result = await roleController.getRoles();

      expect(roleService.findAccessControlView).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockRoles);
    });
  });

  describe('updateRole', () => {
    it('should call roleService.updateRole with correct params', async () => {
      const roleId = 'role-123';
      const updateRoleDto: UpdateRoleRequestDto = {
        rights: [1],
      };

      await roleController.updateRole(roleId, updateRoleDto);

      expect(roleService.updateRole).toHaveBeenCalledWith(
        roleId,
        updateRoleDto,
      );
      expect(roleService.updateRole).toHaveBeenCalledTimes(1);
    });
  });
});
