import { Menu } from '../../menu';
import { MonthlyMoneyConfig, OperationFee } from '../../../monthly-money';
import { RecruitmentEvent } from '../../../recruitment/domain/entities/recruitment-event.entity';
import { RecruitmentEmployee } from '../../../recruitment/domain/entities/recruitment-employee.entity';
import { EmployeeEventPoint } from '../../../recruitment/domain/entities/employee-event-point.entity';
import { join } from 'path';
import { User } from '../../../account-service/domain/entities/user.entity';
import { Role } from '../../../account-service/domain/entities/role.entity';
import { Permission } from '../../../account-service/domain/entities/permission.entity';
import { Post } from '../../../posts-service/domain/entities/posts.entity';
import { Category } from '../../../posts-service/domain/entities/category.entity';
import { MasterDataCommon } from '../../../master-data/entities/master-data.entity';
import { Payment } from '../../../monthly-money/client/entities/payment.entity';

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
  Post,
  Category,
  MasterDataCommon,
  Payment,
];

export const MIGRATION_CONFIGS = {
  migrations: [join(__dirname, '../../database/migrations/*{.ts,.js}')],
  migrationsTableName: 'migrations',
};
