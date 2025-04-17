import { RoleRepository } from '../repositories/role.repository';
import { Inject, Injectable } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import uniq from 'lodash/uniq';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from '../../shared/entities/permission.entity';
import { RoleService } from '../interfaces/role-service.interface';
import { AccessControlView, Right } from '../dtos/core/role-list.dto';
import { UpdateRoleDto } from '../dtos/core/update-role.dto';
import { Role } from '../../shared/entities/role.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { EnvironmentKeyFactory } from '../../../system/services';
import ms from 'ms';
import { Permissions } from '../access-definition.constant';
import { InvalidRoleUpdateException } from '../exceptions/invalid-role-update.exception';
import { CreateRoleRequestDTO } from 'src/account-service/management/controllers/create-role-request.dto';

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

  async createRole(createRoleRequestDTO: CreateRoleRequestDTO): Promise<void> {
    await this.roleRepository.insert(createRoleRequestDTO);
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
          assignedUsers: role.users,
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

  async findPermissionsByUserId(userId: string): Promise<string[]> {
    const rights: string[] | undefined = await this.cacheManager.get<
      string[] | undefined
    >(RoleServiceImpl.genKey(userId));

    if (!rights) {
      const roles = await this.roleRepository.find({
        where: { users: { id: userId } },
        relations: ['permissions'],
      });

      if (
        roles.some((role) =>
          role.permissions.some((p) => p.name === Permissions.OWNER),
        )
      ) {
        const permissions = await this.permissionRepository.find();

        return await this.cacheManager.set(
          RoleServiceImpl.genKey(userId),
          permissions.map((permission) => permission.name),
          this.ttl,
        );
      }

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
