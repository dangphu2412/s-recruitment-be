import { RoleRepository } from '../repositories/role.repository';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import uniq from 'lodash/uniq';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from '../../../system/database/entities/permission.entity';
import { RoleService } from '../interfaces/role-service.interface';
import { AccessControlView, Right } from '../dtos/core/role-list.dto';
import { UpdateRoleDto } from '../dtos/core/update-role.dto';
import { Role } from '../../../system/database/entities/role.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import ms from 'ms';
import { Permissions } from '../access-definition.constant';
import { CreateRoleRequestDTO } from 'src/account-service/authorization/dtos/presentation/create-role-request.dto';
import { UpdateAssignedPersonsRequestDTO } from 'src/account-service/authorization/dtos/presentation/update-assigned-persons.request';
import { UserRepository } from '../../management/repositories/user.repository';
import { GetAccessControlRequestDTO } from '../dtos/presentation/get-access-control.request';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RoleServiceImpl implements RoleService {
  private readonly ttl: number;

  private static genKey = (userId: string): string => {
    return `RK-${userId}`;
  };

  private static toRights(roles: Role[]): string[] {
    return roles
      .map((role) => role.permissions.map((permission) => permission.code))
      .flat();
  }

  constructor(
    private readonly roleRepository: RoleRepository,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    configService: ConfigService,
    private userRepository: UserRepository,
  ) {
    this.ttl = ms(configService.getOrThrow<string>('REFRESH_TOKEN_EXPIRATION'));
  }

  async updateAssignedPersonsToRole(
    id: number,
    dto: UpdateAssignedPersonsRequestDTO,
  ): Promise<void> {
    const users = await this.userRepository.find({
      where: {
        id: In(dto.userIds),
      },
      select: ['id'],
    });

    if (users.length !== dto.userIds.length) {
      throw new NotFoundException();
    }

    await this.roleRepository.updateAssignedPerson(id, dto.userIds);
  }

  async createRole(createRoleRequestDTO: CreateRoleRequestDTO): Promise<void> {
    await this.roleRepository.insert(createRoleRequestDTO);
  }

  findByName(name: string): Promise<Role> {
    return this.roleRepository.findOne({ where: { name } });
  }

  async findAccessControlView(
    dto: GetAccessControlRequestDTO,
  ): Promise<AccessControlView> {
    const [roles, allPermissions] = await Promise.all([
      this.roleRepository.findAccessControlList(dto),
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
          totalUsers: role.totalUsers,
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

  findMyRoles(userId: string): Promise<Role[]> {
    return this.roleRepository.find({
      where: {
        users: {
          id: userId,
        },
      },
    });
  }

  async updateRole(
    id: number,
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
      throw new NotFoundException();
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
          role.permissions.some((p) => p.code === Permissions.OWNER),
        )
      ) {
        const permissions = await this.permissionRepository.find();

        return await this.cacheManager.set(
          RoleServiceImpl.genKey(userId),
          permissions.map((permission) => permission.code),
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
