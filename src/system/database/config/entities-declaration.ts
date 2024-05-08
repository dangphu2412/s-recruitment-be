import { Menu } from '../../menu';
import { MonthlyMoneyConfig, OperationFee } from '../../../monthly-money';
import { RecruitmentEvent } from '../../../recruitment/domain/entities/recruitment-event.entity';
import { RecruitmentEmployee } from '../../../recruitment/domain/entities/recruitment-employee.entity';
import { EmployeeEventPoint } from '../../../recruitment/domain/entities/employee-event-point.entity';
import { join } from 'path';
import { User } from '../../../account-service/domain/entities/user.entity';
import { Role } from '../../../account-service/domain/entities/role.entity';
import { Permission } from '../../../account-service/domain/entities/permission.entity';

export const APP_ENTITIES = [
  User,
  Role,
  Menu,
  MonthlyMoneyConfig,
  OperationFee,
  Permission,
  RecruitmentEvent,
  RecruitmentEmployee,
  EmployeeEventPoint,
];

export const MIGRATION_CONFIGS = {
  migrations: [join(__dirname, '../../database/migrations/*{.ts,.js}')],
  migrationsTableName: 'migrations',
};
