import { Menu } from '../../../menu';
import { join } from 'path';
import { User } from '../../../account-service/shared/entities/user.entity';
import { Role } from '../../../account-service/shared/entities/role.entity';
import { Permission } from '../../../account-service/shared/entities/permission.entity';
import { Post } from '../../../posts-service/domain/data-access/entities/posts.entity';
import { Category } from '../../../posts-service/domain/data-access/entities/category.entity';
import { Payment } from '../../../monthly-money/domain/data-access/entities/payment.entity';
import { MonthlyMoneyConfig } from '../../../monthly-money/domain/data-access/entities/monthly-money-config.entity';
import { OperationFee } from '../../../monthly-money/domain/data-access/entities/operation-fee.entity';
import { Period } from '../../../master-data-service/periods/period.entity';
import { Department } from '../../../master-data-service/departments/department.entity';
import { ActivityRequest } from '../../../activities/domain/data-access/activity-request.entity';
import { Activity } from '../../../activities/domain/data-access/activity.entity';
import { DayOfWeek } from '../../../master-data-service/day-of-weeks/day-of-week';
import { TimeOfDay } from '../../../master-data-service/time-of-days/time-of-day.entity';
import { ActivityLog } from '../../../activities/domain/data-access/activity-log.entity';
import { DeviceUser } from '../../../activities/domain/data-access/user-log.entity';

export const APP_ENTITIES = [
  User,
  Role,
  Menu,
  MonthlyMoneyConfig,
  OperationFee,
  Permission,
  Post,
  Category,
  Payment,
  Period,
  Department,
  ActivityRequest,
  Activity,
  ActivityLog,
  DeviceUser,
  DayOfWeek,
  TimeOfDay,
];

export const MIGRATION_CONFIGS = {
  migrations: [join(__dirname, '../../database/migrations/*{.ts,.js}')],
  migrationsTableName: 'migrations',
};
