import { RoleRepository } from './role.repository';
import { Inject, Injectable } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import uniq from 'lodash/uniq';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from '../domain/entities/permission.entity';
import { RoleService } from '../domain/interfaces/role.service';
import {
  AccessRightStorage,
  AccessRightStorageToken,
} from '../domain/interfaces/access-right-storage';
import { AccessControlView, Right } from '../domain/dtos/role-list.dto';
import { UpdateRoleDto } from '../domain/dtos/update-role.dto';
import { InvalidRoleUpdateException } from '../domain/exceptions';
import { Role } from '../domain/entities/role.entity';

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
