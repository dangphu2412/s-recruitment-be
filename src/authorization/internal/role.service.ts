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
import { Permission } from 'src/authorization/client/entities/permission.entity';
import { UpdateRoleDto } from 'src/authorization/client/dto';
import { In, Repository } from 'typeorm';
import uniq from 'lodash/uniq';
import { InvalidRoleUpdateException } from 'src/authorization/client/exceptions/invalid-role-update.exception';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class RoleServiceImpl implements RoleService {
  constructor(
    private readonly roleRepository: RoleRepository,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
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
      this.roleRepository.findOne({
        where: { id },
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
}
