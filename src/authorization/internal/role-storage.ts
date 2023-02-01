import { AccessRightStorage } from '../client';
import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
import ms from 'ms';

@Injectable()
export class AccessRightStorageImpl implements AccessRightStorage {
  private static readonly CACHE_KEY = 'RK';
  private readonly ttl: number;

  private static generateCacheKey(userId: string): string {
    return `${AccessRightStorageImpl.CACHE_KEY}-${userId}`;
  }

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    configService: ConfigService,
  ) {
    const refreshTokenExpiration = configService.get<string>(
      'REFRESH_TOKEN_EXPIRATION',
      '1h',
    );
    this.ttl = ms(refreshTokenExpiration);
  }

  get(userId: string): Promise<Record<string, boolean> | undefined> {
    return this.cacheManager.get<Record<string, boolean>>(
      AccessRightStorageImpl.generateCacheKey(userId),
    );
  }

  async set(userId: string, accessRights: string[]): Promise<void> {
    await this.cacheManager.set(
      AccessRightStorageImpl.generateCacheKey(userId),
      accessRights,
      this.ttl,
    );
  }

  async clean(userId: string): Promise<void> {
    await this.cacheManager.del(
      AccessRightStorageImpl.generateCacheKey(userId),
    );
  }
}
