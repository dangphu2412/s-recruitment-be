import { MigrationInterface, QueryRunner } from 'typeorm';
import { Permission } from '../entities/permission.entity';
import { Permissions } from '../../../account-service/authorization/access-definition.constant';
import { Menu } from '../entities/menu.entity';
import { PermissionMenuSettingsConnector } from '../processors/permission-menu-settings.connector';
import { MenuCode } from '../../../menu/domain/menu-code.constant';

export class UpdatePermissionMatrixOfActivityRequest1759241700772
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const permissionRepository = queryRunner.manager.getRepository(Permission);
    const menuRepository = queryRunner.manager.getRepository(Menu);

    await permissionRepository.insert([
      {
        name: 'Process activity requests',
        code: Permissions.PROCESS_ACTIVITY_REQUESTS,
        description: 'Process the request: approve, reject, revise.',
      },
    ]);

    const menuDefinePermissions: Record<string, Array<string>> = {
      [MenuCode.MY_ACTIVITY_REQUESTS]: [Permissions.READ_MY_ACTIVITY_REQUESTS],
    };
    await new PermissionMenuSettingsConnector(
      permissionRepository,
      queryRunner.manager,
    ).unlink(menuDefinePermissions);

    await menuRepository.delete(MenuCode.MY_ACTIVITY_REQUESTS);
  }

  public async down(): Promise<void> {
    return;
  }
}
