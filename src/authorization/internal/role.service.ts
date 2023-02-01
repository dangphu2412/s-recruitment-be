import { RoleRepository } from './repositories/role.repository';
import { Injectable } from '@nestjs/common';
import { AccessControlList, Right, Role, RoleService } from '../client';
import { PermissionRepository } from '@authorization/internal/repositories/permission.repository';
import { Permission } from '@authorization/client/entities/permission.entity';

@Injectable()
export class RoleServiceImpl implements RoleService {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly permissionRepository: PermissionRepository,
  ) {}

  async findAccessControlList(): Promise<AccessControlList> {
    const [roles, allPermissions] = await Promise.all([
      this.roleRepository.find({
        relations: ['permissions'],
      }),
      this.permissionRepository.find(),
    ]);

    return {
      access: roles.map((role: Role) => {
        const grantedPermissionIdDict = role.permissions.reduce<
          Record<string, boolean>
        >((grantedPermissionIdDictResult, currentPermission) => {
          grantedPermissionIdDictResult[currentPermission.id] = true;

          return grantedPermissionIdDictResult;
        }, {});

        return {
          name: role.name,
          rights: allPermissions.map<Right>((permission: Permission) => {
            return {
              ...permission,
              canAccess: !!grantedPermissionIdDict[permission.id],
            };
          }),
        };
      }),
    };
  }
}
