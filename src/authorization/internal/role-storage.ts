import type { Cache } from 'cache-manager';
import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import ms from 'ms';
import { ModuleConfig } from '@shared/services';
import { AccessRightStorage, Role } from '../client';
import { UserService, UserServiceToken } from '../../user';

@Injectable()
export class AccessRightStorageImpl implements AccessRightStorage {
  private static readonly CACHE_KEY = 'RK';
  private readonly ttl: number;

  private static genKey = (userId: string): string => {
    return `${AccessRightStorageImpl.CACHE_KEY}-${userId}`;
  };

  private static toRights(roles: Role[]): string[] {
    return roles
      .map((role) => role.permissions.map((permission) => permission.name))
      .flat();
  }

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    @Inject(UserServiceToken)
    private readonly userService: UserService,
    moduleConfig: ModuleConfig,
  ) {
    const refreshTokenExpiration = moduleConfig.getRefreshTokenExpiration();
    this.ttl = ms(refreshTokenExpiration);
  }

  async get(userId: string): Promise<string[] | undefined> {
    const rights = await this.cacheManager.get<string[] | undefined>(
      AccessRightStorageImpl.genKey(userId),
    );

    if (!rights) {
      return await this.renew(userId);
    }

    return rights;
  }

  async renew(userId: string): Promise<string[]> {
    const { roles } = await this.userService.findById(userId, [
      'roles',
      'roles.permissions',
    ]);

    return await this.cacheManager.set(
      AccessRightStorageImpl.genKey(userId),
      AccessRightStorageImpl.toRights(roles),
      this.ttl,
    );
  }

  async clean(userId: string): Promise<void>;
  async clean(userIds: string[]): Promise<void>;
  async clean(idOrIds: string | string[]): Promise<void> {
    const ids = Array.isArray(idOrIds)
      ? idOrIds.map(AccessRightStorageImpl.genKey)
      : [AccessRightStorageImpl.genKey(idOrIds)];

    await this.cacheManager.store.del<string>(ids);
  }
}
