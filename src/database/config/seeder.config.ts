import { connectionConfig } from './base-connection.config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist/interfaces/typeorm-options.interface';

export default {
  ...connectionConfig,
  migrations: [`${process.cwd()}/**/database/seeders/*.js`],
  migrationsTableName: 'seeder',
  cli: {
    migrationsDir: 'src/database/seeders',
  },
} as TypeOrmModuleOptions;
