import { connectionConfig } from './base-connection.config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist/interfaces/typeorm-options.interface';
import { join } from 'path';

export default {
  ...connectionConfig,
  migrations: [join(__dirname, '../../database/seeders/*{.ts,.js}')],
  migrationsTableName: 'seeder',
  cli: {
    migrationsDir: 'src/database/seeders',
  },
} as TypeOrmModuleOptions;
