import { connectionConfig } from './base-connection.config';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { DataSourceOptions } from 'typeorm/data-source/DataSourceOptions';

export default new DataSource({
  ...connectionConfig,
  migrations: [join(__dirname, '../../database/seeders/*{.ts,.js}')],
  migrationsTableName: 'seeder',
} as DataSourceOptions);
