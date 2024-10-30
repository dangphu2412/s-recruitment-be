import { Menu } from '../../menu';
import { RecruitmentEvent } from '../../../recruitment/domain/data-access/entities/recruitment-event.entity';
import { RecruitmentEmployee } from '../../../recruitment/domain/data-access/entities/recruitment-employee.entity';
import { EmployeeEventPoint } from '../../../recruitment/domain/data-access/entities/employee-event-point.entity';
import { join } from 'path';
import { User } from '../../../account-service/domain/data-access/entities/user.entity';
import { Role } from '../../../account-service/domain/data-access/entities/role.entity';
import { Permission } from '../../../account-service/domain/data-access/entities/permission.entity';
import { Post } from '../../../posts-service/domain/data-access/entities/posts.entity';
import { Category } from '../../../posts-service/domain/data-access/entities/category.entity';
import { MasterDataCommon } from '../../../master-data/entities/master-data.entity';
import { Payment } from '../../../monthly-money/domain/data-access/entities/payment.entity';
import { UserGroup } from '../../../account-service/domain/data-access/entities/user-group.entity';
import { MonthlyMoneyConfig } from '../../../monthly-money/domain/data-access/entities/monthly-money-config.entity';
import { OperationFee } from '../../../monthly-money/domain/data-access/entities/operation-fee.entity';

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
  UserGroup,
];

export const MIGRATION_CONFIGS = {
  migrations: [join(__dirname, '../../database/migrations/*{.ts,.js}')],
  migrationsTableName: 'migrations',
};
