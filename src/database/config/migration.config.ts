import { connectionConfig } from './base-connection.config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist/interfaces/typeorm-options.interface';

export default {
  ...connectionConfig,
  migrations: [`${process.cwd()}/**/database/migrations/*.js`],
  migrationsTableName: 'migrations',
  cli: {
    migrationsDir: 'src/database/migrations',
  },
} as TypeOrmModuleOptions;
