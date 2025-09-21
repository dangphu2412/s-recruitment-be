import { MigrationInterface, QueryRunner } from 'typeorm';
import { DayOfWeek } from '../entities/day-of-week';
import { TimeOfDay } from '../entities/time-of-day.entity';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { RolePermissionConnector } from '../processors/role-permission.connector';
import {
  Permissions,
  SystemRoles,
} from '../../../account-service/authorization/access-definition.constant';
import { User } from '../entities/user.entity';
import { PasswordManager } from '../../../account-service/registration/services/password-manager';
import { ConfigService } from '@nestjs/config';
import { Menu } from '../entities/menu.entity';
import { MenuFactory } from '../processors/menu.factory';
import { MonthlyMoneyConfig } from '../entities/monthly-money-config.entity';
import { PermissionMenuSettingsConnector } from '../processors/permission-menu-settings.connector';
import { Department } from '../entities/department.entity';
import { MenuCode } from '../../../menu/client/menu-code.constant';
import { DatabaseUtils } from '../utils/database.utils';

type InsertMenu = Omit<Menu, 'parent' | 'subMenus' | 'parentId'> & {
  subMenus?: InsertMenu[];
};

export class SeedInitData1733908606009 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const roleRepository = queryRunner.manager.getRepository(Role);
    const permissionRepository = queryRunner.manager.getRepository(Permission);
    const rolePermissionConnector = new RolePermissionConnector(
      roleRepository,
      permissionRepository,
    );

    await roleRepository.insert([
      {
        name: SystemRoles.SUPER_ADMIN,
        description: 'The highest role in the system',
        isEditable: false,
      },
      {
        name: SystemRoles.HR,
        description: 'User who charge of manage resource of organization',
      },
      {
        name: SystemRoles.LEADER,
        description: 'User who is the leader of a presentation or group',
      },
      {
        name: SystemRoles.MEDIA,
        description: 'User who is in media team',
      },
      {
        name: SystemRoles.TRAINER,
        description:
          'User who is the trainer of a presentation or group, can view and edit users',
      },
      {
        name: SystemRoles.MEMBER,
        description: 'Member in the system',
      },
    ]);
    await permissionRepository.insert([
      {
        name: 'Owner',
        code: Permissions.OWNER,
        description: 'Owner of system',
      },
      {
        name: 'Write users',
        code: Permissions.WRITE_USERS,
        description: 'Modify user',
      },
      {
        name: 'Read users',
        code: Permissions.READ_USERS,
        description: 'View users of system',
      },
      {
        name: 'Read identity access management',
        code: Permissions.READ_IAM,
        description: 'Read access rights of system',
      },
      {
        name: 'Edit identity access management',
        code: Permissions.EDIT_IAM,
        description: 'Edit roles of system',
      },
      {
        name: 'Read activities',
        code: Permissions.READ_ACTIVITIES,
        description: 'Read working',
      },
      {
        name: 'Write activities',
        code: Permissions.WRITE_ACTIVITIES,
        description: 'Write working',
      },
      {
        name: 'Read activity logs',
        code: Permissions.READ_ACTIVITY_LOGS,
        description: 'Read activity logs',
      },
      {
        name: 'Write activity logs',
        code: Permissions.WRITE_ACTIVITY_LOGS,
        description: 'Write activity logs',
      },
      {
        name: 'Read activity requests',
        code: Permissions.READ_ACTIVITY_REQUESTS,
        description: 'Read activity requests',
      },
      {
        name: 'Write activity requests',
        code: Permissions.WRITE_ACTIVITY_REQUESTS,
        description: 'Write activity requests',
      },
      {
        name: 'Read my activity requests',
        code: Permissions.READ_MY_ACTIVITY_REQUESTS,
        description: 'Read my activity requests',
      },
      {
        name: 'Write my activity requests',
        code: Permissions.WRITE_MY_ACTIVITY_REQUESTS,
        description: 'Write my activity requests',
      },
      {
        name: 'Read fingerprint users',
        code: Permissions.READ_FINGERPRINT_USERS,
        description: 'Read fingerprint users',
      },
      {
        name: 'Write fingerprint users',
        code: Permissions.WRITE_FINGERPRINT_USERS,
        description: 'Write fingerprint users',
      },
      {
        name: 'Write periods',
        code: Permissions.WRITE_PERIODS,
        description: 'Write periods',
      },
      {
        name: 'Write departments',
        code: Permissions.WRITE_DEPARTMENTS,
        description: 'Write departments',
      },
      {
        name: 'Read payments',
        code: Permissions.READ_PAYMENTS,
        description: 'Read payments',
      },
      {
        name: 'Write payments',
        code: Permissions.WRITE_PAYMENTS,
        description: 'Write payments',
      },
    ]);

    const roleNameMapToPermissionCodes = {
      [SystemRoles.SUPER_ADMIN]: [Permissions.OWNER],
      [SystemRoles.LEADER]: [Permissions.READ_USERS],
      [SystemRoles.HR]: [Permissions.READ_USERS, Permissions.WRITE_USERS],
      [SystemRoles.TRAINER]: [],
      [SystemRoles.MEDIA]: [],
      [SystemRoles.MEMBER]: [],
    };

    await Promise.all(
      Object.keys(roleNameMapToPermissionCodes).map((roleName) => {
        rolePermissionConnector.process({
          roleName: roleName,
          permissionCodes: roleNameMapToPermissionCodes[roleName],
        });
      }),
    );

    const userRepository = queryRunner.manager.getRepository(User);

    const adminRole = await roleRepository.findOne({
      where: {
        name: SystemRoles.SUPER_ADMIN,
      },
    });
    const passwordManager = new PasswordManager(
      new ConfigService<Record<string, unknown>, false>(),
    );
    await passwordManager.onModuleInit();
    const password = passwordManager.getDefaultPassword();
    const user = new User();
    user.fullName = 'Phu Dep Trai';
    user.email = 'noibosgroup@gmail.com';
    user.username = 'noibosgroup@gmail.com';
    user.password = password;
    user.roles = [adminRole];
    user.period = null;
    user.department = null;
    user.operationFee = null;
    await userRepository.save(user);

    const menuRepository = queryRunner.manager.getTreeRepository(Menu);
    const menuProcessor = new MenuFactory(menuRepository);

    const menus: InsertMenu[] = [
      {
        name: 'User Management',
        iconCode: 'USER_MANAGEMENT_ICON',
        id: MenuCode.USER_MANAGEMENT,
        subMenus: [
          {
            name: 'User Overview',
            accessLink: '/users',
            id: MenuCode.USER_OVERVIEW,
          },
          {
            name: 'IAM',
            accessLink: '/users/iam',
            id: MenuCode.IDENTITY_ACCESS_MANAGEMENT,
          },
          {
            name: 'Departments',
            accessLink: '/users/departments',
            id: MenuCode.USER_DEPARTMENTS,
          },
          {
            name: 'Periods',
            accessLink: '/users/periods',
            id: MenuCode.USER_PERIODS,
          },
        ],
      },
      {
        name: 'Activities',
        iconCode: 'ACTIVITY_MANAGEMENT_ICON',
        id: MenuCode.ACTIVITY_MANAGEMENT,
        subMenus: [
          {
            name: 'Requests',
            accessLink: '/activities/requests',
            id: MenuCode.ACTIVITY_REQUESTS,
          },
          {
            name: 'My requests',
            accessLink: '/activities/requests/my',
            id: MenuCode.MY_ACTIVITY_REQUESTS,
          },
          {
            name: 'Activities',
            accessLink: '/activities',
            id: MenuCode.ACTIVITIES,
          },
          {
            name: 'Activities logs',
            accessLink: '/activities/tracking',
            id: MenuCode.ACTIVITIES_LOGS,
          },
          {
            name: 'Fingerprint users',
            accessLink: '/activities/fingerprint-users',
            id: MenuCode.FINGERPRINT_USERS,
          },
        ],
      },
    ];

    await menuProcessor.create(menus);

    const dayOfWeekRepository = queryRunner.manager.getRepository(DayOfWeek);
    const timeOfDayRepository = queryRunner.manager.getRepository(TimeOfDay);

    await dayOfWeekRepository.insert([
      { id: '0', name: 'Sun' },
      { id: '1', name: 'Mon' },
      { id: '2', name: 'Tue' },
      { id: '3', name: 'Wed' },
      { id: '4', name: 'Thu' },
      { id: '5', name: 'Fri' },
      { id: '6', name: 'Sat' },
    ]);

    await timeOfDayRepository.insert([
      {
        id: 'SUM-MORN',
        name: 'Morning (08h00 - 11h00)',
        fromTime: DatabaseUtils.formatTimeToUTC('8:00'),
        toTime: DatabaseUtils.formatTimeToUTC('11:00'),
      },
      {
        id: 'SUM-AFT',
        name: 'Afternoon (14h00 – 17h00)',
        fromTime: DatabaseUtils.formatTimeToUTC('14:00'),
        toTime: DatabaseUtils.formatTimeToUTC('17:00'),
      },
      {
        id: 'SUM-EVN',
        name: 'Evening (19h00 – 21h30)',
        fromTime: DatabaseUtils.formatTimeToUTC('19:00'),
        toTime: DatabaseUtils.formatTimeToUTC('21:30'),
      },
    ]);

    await queryRunner.manager.insert(MonthlyMoneyConfig, [
      {
        amount: 200_000,
        monthRange: 24,
      },
    ]);

    const menuSettingsProcessor = new PermissionMenuSettingsConnector(
      permissionRepository,
      queryRunner.manager,
    );
    const ROOT_MENU_CONFIG = [];
    const menuDefinePermissions: Record<string, Array<string>> = {
      [MenuCode.USER_MANAGEMENT]: ROOT_MENU_CONFIG,
      [MenuCode.USER_OVERVIEW]: [Permissions.READ_USERS],
      [MenuCode.IDENTITY_ACCESS_MANAGEMENT]: [Permissions.READ_IAM],
      [MenuCode.USER_DEPARTMENTS]: [Permissions.WRITE_DEPARTMENTS],
      [MenuCode.USER_PERIODS]: [Permissions.WRITE_PERIODS],
      [MenuCode.ACTIVITY_MANAGEMENT]: ROOT_MENU_CONFIG,
      [MenuCode.ACTIVITY_REQUESTS]: [Permissions.READ_ACTIVITY_REQUESTS],
      [MenuCode.MY_ACTIVITY_REQUESTS]: [Permissions.READ_MY_ACTIVITY_REQUESTS],
      [MenuCode.ACTIVITIES]: [Permissions.READ_ACTIVITIES],
      [MenuCode.ACTIVITIES_LOGS]: [Permissions.READ_ACTIVITY_LOGS],
      [MenuCode.FINGERPRINT_USERS]: [Permissions.READ_FINGERPRINT_USERS],
    };

    await menuSettingsProcessor.process(menuDefinePermissions);

    const departmentRepository = queryRunner.manager.getRepository(Department);

    await departmentRepository.insert([
      {
        id: 'Lập trình',
        name: 'IT',
        description: 'Information Technology',
      },
      {
        id: 'Thiết kế',
        name: 'Design',
        description: 'Design',
      },
      {
        id: 'MO',
        name: 'Marketing Online',
        description: 'Marketing Online',
      },
    ]);
  }

  public async down(): Promise<void> {
    return;
  }
}
