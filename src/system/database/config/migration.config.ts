import { DataSource } from 'typeorm';
import { DataSourceOptions } from 'typeorm/data-source/DataSourceOptions';
import { connectionConfig } from './base-connection.config';
import { MIGRATION_CONFIGS } from './entities-declaration';

export default new DataSource({
  ...connectionConfig,
  ...MIGRATION_CONFIGS,
} as DataSourceOptions);
