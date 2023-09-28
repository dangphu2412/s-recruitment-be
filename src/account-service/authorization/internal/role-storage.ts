import type { Cache } from 'cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import ms from 'ms';
import { EnvironmentKeyFactory } from 'src/system/services';
import { AccessRightStorage, Role } from '../client';

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
    environmentKeyFactory: EnvironmentKeyFactory,
  ) {
    const refreshTokenExpiration =
      environmentKeyFactory.getRefreshTokenExpiration();
    this.ttl = ms(refreshTokenExpiration);
  }

  async get(userId: string): Promise<string[]> {
    const rights: string[] | undefined = await this.cacheManager.get<
      string[] | undefined
    >(AccessRightStorageImpl.genKey(userId));

    return rights ?? [];
  }

  async save(userId: string, roles: Role[]): Promise<string[]> {
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
