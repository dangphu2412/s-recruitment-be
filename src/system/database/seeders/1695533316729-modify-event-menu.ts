import { MigrationInterface, QueryRunner } from 'typeorm';
import { MenuFactory } from '../processors/menu.factory';
import { Menu } from '../../menu';
import { Permission } from '../../../account-service/domain/data-access/entities/permission.entity';
import {
  AccessRights,
  SystemRoles,
} from '../../../account-service/domain/constants/role-def.enum';
import { Role } from '../../../account-service/domain/data-access/entities/role.entity';
import { PermissionMenuSettingsConnector } from '../processors/permission-menu-settings.connector';
import { RolePermissionConnector } from '../processors/role-permission.connector';

export class ModifyEventMenu1695533316729 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const menuRepository = queryRunner.manager.getTreeRepository(Menu);
    const permissionRepository = queryRunner.manager.getRepository(Permission);
    const roleRepository = queryRunner.manager.getRepository(Role);
    const menuProcessor = new MenuFactory(menuRepository);
    const menuSettingsProcessor = new PermissionMenuSettingsConnector(
      permissionRepository,
      menuRepository,
    );
    const rolePermissionProcessor = new RolePermissionConnector(
      roleRepository,
      permissionRepository,
    );

    await permissionRepository.save({
      name: AccessRights.MANAGE_RECRUITMENT,
      description: 'Manage recruitment',
    });
    await menuProcessor.create([
      {
        name: 'Recruitment',
        iconCode: 'RECRUITMENT_ICON',
        code: 'RECRUITMENT',
        subMenus: [
          {
            name: 'Recruitment Overview',
            accessLink: '/recruitments/overview',
            code: 'RECRUITMENT_OVERVIEW',
          },
        ],
      },
    ]);
    await menuSettingsProcessor.process({
      permissionCode: AccessRights.MANAGE_RECRUITMENT,
      menuCodes: ['RECRUITMENT', 'RECRUITMENT_OVERVIEW'],
    });
    await rolePermissionProcessor.process({
      roleName: SystemRoles.SUPER_ADMIN,
      permissionCodes: [AccessRights.MANAGE_RECRUITMENT],
    });
  }

  public async down(): Promise<void> {
    return;
  }
}
