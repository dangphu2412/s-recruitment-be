import { RoleRepository } from './repositories/role.repository';
import { Inject, Injectable } from '@nestjs/common';
import {
  AccessControlView,
  AccessRightStorage,
  AccessRightStorageToken,
  Right,
  Role,
  RoleService,
} from '../client';
import { PermissionRepository } from '@authorization/internal/repositories/permission.repository';
import { Permission } from '@authorization/client/entities/permission.entity';
import { UpdateRoleDto } from '@authorization/client/dto';
import { In } from 'typeorm';
import uniq from 'lodash/uniq';
import { InvalidRoleUpdateException } from '@authorization/client/exceptions/invalid-role-update.exception';
import { User } from '../../user';

@Injectable()
export class RoleServiceImpl implements RoleService {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly permissionRepository: PermissionRepository,
    @Inject(AccessRightStorageToken)
    private readonly accessRightStorage: AccessRightStorage,
  ) {}

  async findAccessControlView(): Promise<AccessControlView> {
    const [roles, allPermissions] = await Promise.all([
      this.roleRepository.findAccessControlList(),
      this.permissionRepository.find(),
    ]);

    return {
      access: roles.map((role) => {
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

  findByIds(ids: number[]): Promise<Role[]> {
    return this.roleRepository.findByIds(ids);
  }

  async updateUserRoles(user: User, roleIds: number[]): Promise<void> {
    user.roles = await this.roleRepository.findByIds(roleIds);
  }
}
