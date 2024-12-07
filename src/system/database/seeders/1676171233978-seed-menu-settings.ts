import { MigrationInterface, QueryRunner } from 'typeorm';
import { Menu } from '../../menu';
import { Permission } from '../../../account-service/domain/data-access/entities/permission.entity';
import { Permissions } from '../../../account-service/domain/constants/role-def.enum';
import { PermissionMenuSettingsConnector } from '../processors/permission-menu-settings.connector';

export class SeedMenuSettings1676171233978 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const permissionRepository = queryRunner.manager.getRepository(Permission);
    const menuRepository = queryRunner.manager.getTreeRepository(Menu);

    const menuSettingsProcessor = new PermissionMenuSettingsConnector(
      permissionRepository,
      menuRepository,
    );

    const permissionDefineMenus: Record<string, Array<string>> = {
      [Permissions.VIEW_USERS]: ['USER_MANAGEMENT', 'ADMIN'],
      [Permissions.EDIT_MEMBER_USER]: ['ADMIN'],
      [Permissions.VIEW_ACCESS_RIGHTS]: ['ACCESS_CONTROL'],
      [Permissions.EDIT_ACCESS_RIGHTS]: ['ACCESS_CONTROL'],
      [Permissions.WRITE_USER_GROUPS]: ['USER_GROUPS'],
      [Permissions.READ_USER_GROUPS]: ['USER_GROUPS'],
      [Permissions.WRITE_ASSESSMENTS]: ['USER_ASSESSMENT'],
      [Permissions.READ_ASSESSMENTS]: ['USER_ASSESSMENT'],
      [Permissions.MANAGE_RECRUITMENT]: ['RECRUITMENT', 'RECRUITMENT_OVERVIEW'],
      [Permissions.MANAGE_POSTS]: ['POSTS_OVERVIEW', 'POST'],
      [Permissions.READ_ACTIVITIES]: ['MY_ACTIVITY_REQUESTS'],
      [Permissions.WRITE_ACTIVITIES]: [
        'ACTIVITY_MANAGEMENT',
        'ACTIVITY_REQUESTS',
      ],
    };

    await Promise.all(
      Object.keys(permissionDefineMenus).map((permission) => {
        return menuSettingsProcessor.process({
          permissionCode: permission,
          menuCodes: permissionDefineMenus[permission],
        });
      }),
    );
  }

  public async down(): Promise<void> {
    return;
  }
}
