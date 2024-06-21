import { MigrationInterface, QueryRunner } from 'typeorm';
import { MenuProcessor } from '../processors/menu.processor';
import { Menu } from '../../menu';
import { Permission } from '../../../account-service/domain/entities/permission.entity';
import {
  AccessRights,
  SystemRoles,
} from '../../../account-service/domain/constants/role-def.enum';
import { Role } from '../../../account-service/domain/entities/role.entity';
import { MenuSettingsProcessor } from '../processors/menu-settings.processor';
import { RolePermissionProcessor } from '../processors/role-permission.processor';

export class ModifyEventMenu1695533316729 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const menuRepository = queryRunner.manager.getTreeRepository(Menu);
    const permissionRepository = queryRunner.manager.getRepository(Permission);
    const roleRepository = queryRunner.manager.getRepository(Role);
    const menuProcessor = new MenuProcessor(menuRepository);
    const menuSettingsProcessor = new MenuSettingsProcessor(
      permissionRepository,
      menuRepository,
    );
    const rolePermissionProcessor = new RolePermissionProcessor(
      roleRepository,
      permissionRepository,
    );

    await permissionRepository.save({
      name: AccessRights.MANAGE_RECRUITMENT,
      description: 'Manage recruitment',
    });
    await menuProcessor.process([
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
      roleName: SystemRoles.CHAIRMAN,
      permissionCodes: [AccessRights.MANAGE_RECRUITMENT],
    });
  }

  public async down(): Promise<void> {
    return;
  }
}
