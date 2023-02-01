import { RoleRepository } from './repositories/role.repository';
import { Injectable } from '@nestjs/common';
import { AccessControlList, RoleOverview, RoleService } from '../client';
import { PermissionRepository } from '@authorization/internal/repositories/permission.repository';

@Injectable()
export class RoleServiceImpl implements RoleService {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly permissionRepository: PermissionRepository,
  ) {}

  findRoles(): Promise<RoleOverview> {
    return this.roleRepository.find() as Promise<RoleOverview>;
  }

  async findAccessControlListById(id: string): Promise<AccessControlList> {
    const [role, allPermissions] = await Promise.all([
      this.roleRepository.findOne(id, {
        relations: ['permissions'],
      }),
      this.permissionRepository.find(),
    ]);

    const grantedPermissionIdDict = role.permissions.reduce<
      Record<string, boolean>
    >((grantedPermissionIdDictResult, currentPermission) => {
      grantedPermissionIdDictResult[currentPermission.id] = true;

      return grantedPermissionIdDictResult;
    }, {});

    return {
      rights: allPermissions.map((rootPermission) => {
        return {
          ...rootPermission,
          canAccess: !!grantedPermissionIdDict[rootPermission.id],
        };
      }),
    };
  }
}
