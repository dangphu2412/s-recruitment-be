import { Test, TestingModule } from '@nestjs/testing';
import { RoleAuthorizationStrategy } from '../../../src/account-service/authorization/services/role-authorization.strategy';
import { RoleService } from '../../../src/account-service/authorization/interfaces/role-service.interface';
import { JwtPayload } from '../../../src/account-service/registration/jwt-payload';
import { Permissions } from '../../../src/account-service/authorization/access-definition.constant';

jest.mock(
  '../../../src/account-service/authorization/services/authorization-strategy.register',
  () => ({
    registerStrategy: jest.fn(),
  }),
);

describe('RoleAuthorizationStrategy', () => {
  let strategy: RoleAuthorizationStrategy;
  let roleService: jest.Mocked<RoleService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleAuthorizationStrategy,
        {
          provide: RoleService,
          useValue: {
            findPermissionsByUserId: jest.fn(),
          },
        },
      ],
    }).compile();

    strategy = module.get(RoleAuthorizationStrategy);
    roleService = module.get(RoleService);
  });

  it('should return true when user has a required permission', async () => {
    roleService.findPermissionsByUserId.mockResolvedValue([
      'READ_USER',
      'WRITE_USER',
    ]);
    const payload: JwtPayload = { sub: 'user-123' };

    const result = await strategy.canAccess(payload, ['WRITE_USER']);

    expect(result).toBe(true);
    expect(roleService.findPermissionsByUserId).toHaveBeenCalledWith(
      'user-123',
    );
  });

  it('should return false when user lacks required permissions', async () => {
    roleService.findPermissionsByUserId.mockResolvedValue(['READ_USER']);
    const payload: JwtPayload = { sub: 'user-456' };

    const result = await strategy.canAccess(payload, ['DELETE_USER']);

    expect(result).toBe(false);
  });

  it('should return true when user has OWNER permission', async () => {
    roleService.findPermissionsByUserId.mockResolvedValue([Permissions.OWNER]);
    const payload: JwtPayload = { sub: 'owner-1' };

    const result = await strategy.canAccess(payload, ['ANY_PERMISSION']);

    expect(result).toBe(true);
  });

  it('should return false when user has no permissions', async () => {
    roleService.findPermissionsByUserId.mockResolvedValue([]);
    const payload: JwtPayload = { sub: 'empty-1' };

    const result = await strategy.canAccess(payload, ['READ_USER']);

    expect(result).toBe(false);
  });
});
