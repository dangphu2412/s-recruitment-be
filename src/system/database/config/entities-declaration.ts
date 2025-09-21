import { Menu } from '../entities/menu.entity';
import { join } from 'path';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { Payment } from '../entities/payment.entity';
import { MonthlyMoneyConfig } from '../entities/monthly-money-config.entity';
import { OperationFee } from '../entities/operation-fee.entity';
import { Period } from '../entities/period.entity';
import { Department } from '../entities/department.entity';
import { ActivityRequest } from '../entities/activity-request.entity';
import { Activity } from '../entities/activity.entity';
import { DayOfWeek } from '../entities/day-of-week';
import { TimeOfDay } from '../entities/time-of-day.entity';
import { ActivityLog } from '../entities/activity-log.entity';
import { DeviceUser } from '../entities/user-log.entity';

export const APP_ENTITIES = [
  User,
  Role,
  Menu,
  MonthlyMoneyConfig,
  OperationFee,
  Permission,
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
