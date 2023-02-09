import { RoleRepository } from './repositories/role.repository';
import { Inject, Injectable } from '@nestjs/common';
import {
  AccessControlList,
  AccessRightStorage,
  Right,
  Role,
  RoleService,
  AccessRightStorageToken,
} from '../client';
import { PermissionRepository } from '@authorization/internal/repositories/permission.repository';
import { Permission } from '@authorization/client/entities/permission.entity';
import { UpdateRoleDto } from '@authorization/client/dto';
import { In } from 'typeorm';
import uniq from 'lodash/uniq';
import { InvalidRoleUpdateException } from '@authorization/client/exceptions/invalid-role-update.exception';

@Injectable()
export class RoleServiceImpl implements RoleService {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly permissionRepository: PermissionRepository,
    @Inject(AccessRightStorageToken)
    private readonly accessRightStorage: AccessRightStorage,
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
          id: role.id,
          name: role.name,
          description: role.description,
          isEditable: role.isEditable,
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

  async updateRole(
    id: string,
    { rights: permissionIds }: UpdateRoleDto,
  ): Promise<void> {
    const uniqueIds = uniq(permissionIds);

    const [role, permissions] = await Promise.all([
      this.roleRepository.findOne(id, {
        relations: ['users'],
      }),
      this.permissionRepository.find({
        where: {
          id: In(uniqueIds),
        },
      }),
    ]);

    if (!role || !role?.isEditable || permissions.length !== uniqueIds.length) {
      throw new InvalidRoleUpdateException();
    }

    role.permissions = permissions;
    const removalIds = role.users.map((user) => user.id);

    await this.roleRepository.save(role);
    await this.accessRightStorage.clean(removalIds);
  }
}
