import { RoleRepository } from './role.repository';
import { Inject, Injectable } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import uniq from 'lodash/uniq';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from '../domain/data-access/entities/permission.entity';
import { RoleService } from '../domain/core/services/role.service';
import { AccessControlView, Right } from '../domain/dtos/role-list.dto';
import { UpdateRoleDto } from '../domain/dtos/update-role.dto';
import { InvalidRoleUpdateException } from '../domain/core/exceptions';
import { Role } from '../domain/data-access/entities/role.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { EnvironmentKeyFactory } from '../../system/services';
import ms from 'ms';

@Injectable()
export class RoleServiceImpl implements RoleService {
  private readonly ttl: number;

  private static genKey = (userId: string): string => {
    return `RK-${userId}`;
  };

  private static toRights(roles: Role[]): string[] {
    return roles
      .map((role) => role.permissions.map((permission) => permission.name))
      .flat();
  }

  constructor(
    private readonly roleRepository: RoleRepository,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    environmentKeyFactory: EnvironmentKeyFactory,
  ) {
    const refreshTokenExpiration =
      environmentKeyFactory.getRefreshTokenExpiration();
    this.ttl = ms(refreshTokenExpiration);
  }

  findByName(name: string): Promise<Role> {
    return this.roleRepository.findOne({ where: { name } });
  }

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
    await this.clean(removalIds);
  }

  findByIds(ids: number[]): Promise<Role[]> {
    return this.roleRepository.findBy({ id: In(ids) });
  }

  async findAccessRightsByUserId(userId: string): Promise<string[]> {
    const rights: string[] | undefined = await this.cacheManager.get<
      string[] | undefined
    >(RoleServiceImpl.genKey(userId));

    if (!rights) {
      const roles = await this.roleRepository.find({
        where: { users: { id: userId } },
        relations: ['permissions'],
      });

      return this.save(userId, roles);
    }

    return rights;
  }

  async save(userId: string, roles: Role[]): Promise<string[]> {
    return await this.cacheManager.set(
      RoleServiceImpl.genKey(userId),
      RoleServiceImpl.toRights(roles),
      this.ttl,
    );
  }

  async clean(userId: string): Promise<void>;
  async clean(userIds: string[]): Promise<void>;
  async clean(idOrIds: string | string[]): Promise<void> {
    const ids = Array.isArray(idOrIds)
      ? idOrIds.map(RoleServiceImpl.genKey)
      : [RoleServiceImpl.genKey(idOrIds)];

    await this.cacheManager.store.del<string>(ids);
  }
}
