import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';
import { isBooleanString } from 'class-validator';
import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist/interfaces/typeorm-options.interface';
import {
  APP_ENTITIES,
  MIGRATION_CONFIGS,
} from '../database/config/entities-declaration';

@Injectable()
export class EnvironmentKeyFactory {
  constructor(private readonly configService: ConfigService) {}

  private getNumber(key: string): number {
    const value = Number(this.get(key));

    if (isNaN(value)) {
      throw new Error(key + ' environment variable is not a number');
    }

    return value;
  }

  private getBoolean(key: string): boolean {
    const value = this.get(key).toLowerCase();

    if (!isBooleanString(value)) {
      throw new Error(`${key} environment variable is not a boolean`);
    }

    return value === 'true';
  }

  private getString(key: string): string {
    const value = this.get(key);

    return value.replace(/\\n/g, '\n');
  }

  private get(key: string): string {
    const value = this.configService.get(key);

    if (!value) {
      throw new Error(`Missing key: ${key} in environment setup`);
    }

    return value;
  }

  getPort(): string {
    return this.configService.get('PORT') ?? '3000';
  }

  getHost(): string {
    return this.configService.get('HOST') ?? '0.0.0.0';
  }

  getJwtConfig(): JwtModuleOptions {
    return {
      secret: this.getString('JWT_SECRET'),
    };
  }

  getPostgresConfig(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.getString('DB_HOST'),
      username: this.getString('DB_USERNAME'),
      password: this.getString('DB_PASSWORD'),
      port: this.getNumber('DB_PORT'),
      database: this.getString('DB_DATABASE'),
      synchronize: this.getBoolean('DB_SYNC'),
      entities: APP_ENTITIES,
      logging: this.configService.get('NODE_ENV') === 'development',
      migrationsRun: true,
      migrationsTableName: MIGRATION_CONFIGS.migrationsTableName,
      migrations: MIGRATION_CONFIGS.migrations,
    };
  }

  getSaltRounds(): number {
    return this.getNumber('SALT_ROUNDS');
  }

  getAccessTokenExpiration(): string {
    return this.getString('ACCESS_TOKEN_EXPIRATION');
  }

  getRefreshTokenExpiration(): string {
    return this.getString('REFRESH_TOKEN_EXPIRATION');
  }
}
