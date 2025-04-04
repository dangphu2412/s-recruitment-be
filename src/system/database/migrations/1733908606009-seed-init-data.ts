import { MigrationInterface, QueryRunner } from 'typeorm';
import { DayOfWeek } from '../../../master-data-service/day-of-weeks/day-of-week';
import { TimeOfDay } from '../../../master-data-service/time-of-days/time-of-day.entity';
import { Role } from '../../../account-service/domain/data-access/entities/role.entity';
import { Permission } from '../../../account-service/domain/data-access/entities/permission.entity';
import { RolePermissionConnector } from '../processors/role-permission.connector';
import {
  Permissions,
  SystemRoles,
} from '../../../account-service/authorization/access-definition.constant';
import { User } from '../../../account-service/domain/data-access/entities/user.entity';
import { PasswordManager } from '../../../account-service/registration/services/password-manager';
import { EnvironmentKeyFactory } from '../../services';
import { ConfigService } from '@nestjs/config';
import { Menu } from '../../../menu';
import { MenuFactory } from '../processors/menu.factory';
import { MonthlyMoneyConfig } from '../../../monthly-money/domain/data-access/entities/monthly-money-config.entity';
import { PermissionMenuSettingsConnector } from '../processors/permission-menu-settings.connector';
import { Category } from '../../../posts-service/domain/data-access/entities/category.entity';
import { Department } from '../../../master-data-service/departments/department.entity';
import { MenuCode } from '../../../menu/client/menu-code.constant';
import { DatabaseUtils } from '../utils/database.utils';

type InsertMenu = Omit<Menu, 'id' | 'parent' | 'subMenus' | 'parentId'> & {
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
        description: 'User who is the leader of a dtos or group',
      },
      {
        name: SystemRoles.MEDIA,
        description: 'User who is in media team',
      },
      {
        name: SystemRoles.TRAINER,
        description:
          'User who is the trainer of a dtos or group, can view and edit users',
      },
      {
        name: SystemRoles.MEMBER,
        description: 'Member in the system',
      },
    ]);
    await permissionRepository.insert([
      {
        name: Permissions.VIEW_ACCESS_RIGHTS,
        description: 'View access rights of system',
      },
      {
        name: Permissions.EDIT_MEMBER_USER,
        description: 'Modify member user',
      },
      {
        name: Permissions.VIEW_USERS,
        description: 'View users of system',
      },
      {
        name: Permissions.EDIT_ACCESS_RIGHTS,
        description: 'Edit roles of system',
      },
      {
        name: Permissions.READ_USER_GROUPS,
        description: 'Read user groups',
      },
      {
        name: Permissions.WRITE_USER_GROUPS,
        description: 'Write user groups',
      },
      {
        name: Permissions.MANAGE_RECRUITMENT,
        description: 'Manage recruitment',
      },
      {
        name: Permissions.MANAGE_POSTS,
        description: 'Manage public posts of S-Group',
      },
      {
        name: Permissions.MANAGE_MASTER_DATA,
        description: 'Manage master data',
      },
      {
        name: Permissions.READ_ACTIVITIES,
        description: 'Read working',
      },
      {
        name: Permissions.WRITE_ACTIVITIES,
        description: 'Write working',
      },
      {
        name: Permissions.WRITE_PERIODS,
        description: 'Write periods',
      },
      {
        name: Permissions.WRITE_DEPARTMENTS,
        description: 'Write departments',
      },
      {
        name: Permissions.READ_ACTIVITY_LOGS,
        description: 'Read activity logs',
      },
    ]);

    const roleNameMapToPermissionNames = {
      [SystemRoles.SUPER_ADMIN]: [
        Permissions.VIEW_USERS,
        Permissions.EDIT_MEMBER_USER,
        Permissions.EDIT_ACCESS_RIGHTS,
        Permissions.VIEW_ACCESS_RIGHTS,
        Permissions.READ_USER_GROUPS,
        Permissions.WRITE_USER_GROUPS,
        Permissions.MANAGE_RECRUITMENT,
        Permissions.MANAGE_MASTER_DATA,
        Permissions.WRITE_ACTIVITIES,
        Permissions.READ_ACTIVITIES,
        Permissions.MANAGE_POSTS,
        Permissions.WRITE_PERIODS,
        Permissions.WRITE_DEPARTMENTS,
        Permissions.READ_ACTIVITY_LOGS,
      ],
      [SystemRoles.LEADER]: [
        Permissions.VIEW_USERS,
        Permissions.EDIT_MEMBER_USER,
      ],
      [SystemRoles.TRAINER]: [
        Permissions.VIEW_USERS,
        Permissions.EDIT_MEMBER_USER,
      ],
      [SystemRoles.MEDIA]: [
        Permissions.VIEW_USERS,
        Permissions.EDIT_MEMBER_USER,
      ],
      [SystemRoles.HR]: [Permissions.VIEW_USERS, Permissions.EDIT_MEMBER_USER],
      [SystemRoles.MEMBER]: [],
    };

    await Promise.all(
      Object.keys(roleNameMapToPermissionNames).map((roleName) => {
        rolePermissionConnector.process({
          roleName: roleName,
          permissionCodes: roleNameMapToPermissionNames[roleName],
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
      new EnvironmentKeyFactory(
        new ConfigService<Record<string, unknown>, false>(),
      ),
    );
    const password = await passwordManager.getDefaultPassword();
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
        code: MenuCode.USER_MANAGEMENT,
        subMenus: [
          {
            name: 'Administrator',
            accessLink: '/users/admin',
            code: MenuCode.ADMIN,
          },
          {
            name: 'IAM',
            accessLink: '/users/iam',
            code: MenuCode.IDENTITY_ACCESS_MANAGEMENT,
          },
          {
            name: 'User Groups',
            accessLink: '/users/groups',
            code: MenuCode.USER_GROUPS,
          },
          {
            name: 'Departments',
            accessLink: '/users/departments',
            code: MenuCode.USER_DEPARTMENTS,
          },
          {
            name: 'Periods',
            accessLink: '/users/periods',
            code: MenuCode.USER_PERIODS,
          },
        ],
      },
      {
        name: 'Posts',
        iconCode: 'POST_ICON',
        code: MenuCode.POST,
        subMenus: [
          {
            name: 'Post management',
            accessLink: '/posts/overview',
            code: MenuCode.POSTS_OVERVIEW,
          },
        ],
      },
      {
        name: 'Activities',
        iconCode: 'ACTIVITY_MANAGEMENT_ICON',
        code: MenuCode.ACTIVITY_MANAGEMENT,
        subMenus: [
          {
            name: 'Requests',
            accessLink: '/activities/requests',
            code: MenuCode.ACTIVITY_REQUESTS,
          },
          {
            name: 'My requests',
            accessLink: '/activities/requests/my',
            code: MenuCode.MY_ACTIVITY_REQUESTS,
          },
          {
            name: 'Activities',
            accessLink: '/activities',
            code: MenuCode.ACTIVITIES,
          },
          {
            name: 'Activities logs',
            accessLink: '/activities/tracking',
            code: MenuCode.ACTIVITIES_LOGS,
          },
        ],
      },
      {
        name: 'Recruitment',
        iconCode: 'RECRUITMENT_ICON',
        code: MenuCode.RECRUITMENT,
        subMenus: [
          {
            name: 'Recruitment Overview',
            accessLink: '/recruitments/overview',
            code: MenuCode.RECRUITMENT_OVERVIEW,
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
        name: 'Morning (8:30 - 11h30)',
        fromTime: DatabaseUtils.formatTimeToUTC('8:30'),
        toTime: DatabaseUtils.formatTimeToUTC('11:30'),
      },
      {
        id: 'SUM-AFT',
        name: 'Afternoon (13:30 - 17h30)',
        fromTime: DatabaseUtils.formatTimeToUTC('13:30'),
        toTime: DatabaseUtils.formatTimeToUTC('17:30'),
      },
      {
        id: 'SUM-EVN',
        name: 'Evening (19:00 - 21:30)',
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
      menuRepository,
    );

    const permissionDefineMenus: Record<string, Array<string>> = {
      [Permissions.VIEW_USERS]: [MenuCode.ADMIN, MenuCode.USER_MANAGEMENT],
      [Permissions.EDIT_MEMBER_USER]: [MenuCode.ADMIN],
      [Permissions.VIEW_ACCESS_RIGHTS]: [MenuCode.IDENTITY_ACCESS_MANAGEMENT],
      [Permissions.EDIT_ACCESS_RIGHTS]: [MenuCode.IDENTITY_ACCESS_MANAGEMENT],
      [Permissions.WRITE_USER_GROUPS]: [MenuCode.USER_GROUPS],
      [Permissions.READ_USER_GROUPS]: [MenuCode.USER_GROUPS],
      [Permissions.MANAGE_RECRUITMENT]: [
        MenuCode.RECRUITMENT,
        MenuCode.RECRUITMENT_OVERVIEW,
      ],
      [Permissions.MANAGE_POSTS]: [MenuCode.POST, MenuCode.POSTS_OVERVIEW],
      [Permissions.READ_ACTIVITIES]: [
        MenuCode.ACTIVITY_MANAGEMENT,
        MenuCode.MY_ACTIVITY_REQUESTS,
      ],
      [Permissions.READ_ACTIVITY_LOGS]: [MenuCode.ACTIVITIES_LOGS],
      [Permissions.WRITE_ACTIVITIES]: [
        MenuCode.ACTIVITY_MANAGEMENT,
        MenuCode.ACTIVITY_REQUESTS,
        MenuCode.ACTIVITIES,
        MenuCode.ACTIVITY_REQUESTS,
      ],
      [Permissions.WRITE_PERIODS]: [MenuCode.USER_PERIODS],
      [Permissions.WRITE_DEPARTMENTS]: [MenuCode.USER_DEPARTMENTS],
    };

    await Promise.all(
      Object.keys(permissionDefineMenus).map((permission) => {
        return menuSettingsProcessor.process({
          permissionCode: permission,
          menuCodes: permissionDefineMenus[permission],
        });
      }),
    );

    const categoryRepository = queryRunner.manager.getRepository(Category);

    await categoryRepository.insert([
      {
        id: 'cong-nghe',
        name: 'Công nghệ',
        summary: 'Đây là nơi đăng các nội dung về Công Nghệ',
      },
      {
        id: 'thiet-ke',
        name: 'Thiết Kế',
        summary: 'Đây là nơi đăng các nội dung về Thiết Kế',
      },
      {
        id: 'marketing-online',
        name: 'Marketing Online',
        summary: 'Đây là nơi đăng các nội dung về Marketing Online',
      },
      {
        id: 'noi-bo',
        name: 'Nội bộ',
        summary: 'Đây là nơi đăng các nội dung về nội bộ',
      },
    ]);
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
