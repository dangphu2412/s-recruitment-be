import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { DataSource } from 'typeorm';
import { APP_ENTITIES, MIGRATION_CONFIGS } from './config/entities-declaration';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          type: 'postgres',
          migrationsRun: true,
          synchronize: false,
          entities: APP_ENTITIES,
          migrationsTableName: MIGRATION_CONFIGS.migrationsTableName,
          migrations: MIGRATION_CONFIGS.migrations,
          host: configService.getOrThrow<string>('DB_HOST'),
          username: configService.getOrThrow<string>('DB_USERNAME'),
          password: configService.getOrThrow<string>('DB_PASSWORD'),
          port: +configService.getOrThrow<string>('DB_PORT'),
          database: configService.getOrThrow<string>('DB_DATABASE'),
          logging: configService.get('NODE_ENV') !== 'production',
        };
      },
      dataSourceFactory: async (options) => {
        if (!options) {
          throw new Error('Invalid options passed');
        }

        return addTransactionalDataSource(new DataSource(options));
      },
    }),
  ],
})
export class DatabaseModule {}
