import dotenv from 'dotenv';
import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist/interfaces/typeorm-options.interface';
import { User } from '../../../user';
import { Role } from '../../../authorization';
import { Menu } from '../../../menu';
import { MonthlyMoneyConfig, OperationFee } from '../../../monthly-money';
import { Permission } from 'src/authorization/client/entities/permission.entity';
import { MenuSetting } from '../../../menu/client/entities/menu-settings.entity';
import { RecruitmentEvent } from '../../../recruitment/client/entities/recruitment-event.entity';
import { RecruitmentEmployee } from 'src/recruitment/client/entities/recruitment-employee.entity';
import { EmployeeEventPoint } from '../../../recruitment/client/entities/employee-event-point.entity';

dotenv.config();

export const connectionConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_DATABASE,
  entities: [
    User,
    Role,
    Menu,
    MenuSetting,
    MonthlyMoneyConfig,
    OperationFee,
    Permission,
    RecruitmentEvent,
    RecruitmentEmployee,
    EmployeeEventPoint,
  ],
  synchronize: process.env.DB_SYNC ? process.env.DB_SYNC === 'true' : false,
  logging: true,
  migrationsRun: process.env.DB_MIGRATION_RUN
    ? process.env.DB_MIGRATION_RUN === 'true'
    : true,
};
