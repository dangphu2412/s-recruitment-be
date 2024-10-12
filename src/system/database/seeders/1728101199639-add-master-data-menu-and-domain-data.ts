import { MigrationInterface, QueryRunner } from 'typeorm';
import { Menu } from '../../menu';
import { Permission } from '../../../account-service/domain/entities/permission.entity';
import { Role } from '../../../account-service/domain/entities/role.entity';
import { MenuFactory } from '../processors/menu.factory';
import { PermissionMenuSettingsConnector } from '../processors/permission-menu-settings.connector';
import { RolePermissionConnector } from '../processors/role-permission.connector';
import {
  AccessRights,
  SystemRoles,
} from '../../../account-service/domain/constants/role-def.enum';
import { MasterDataCommon } from '../../../master-data/entities/master-data.entity';

export class AddMasterDataMenu1728101199639 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const menuRepository = queryRunner.manager.getTreeRepository(Menu);
    const permissionRepository = queryRunner.manager.getRepository(Permission);
    const roleRepository = queryRunner.manager.getRepository(Role);
    const masterDataCommonRepository =
      queryRunner.manager.getRepository(MasterDataCommon);
    const menuFactory = new MenuFactory(menuRepository);
    const permissionMenuSettingsConnector = new PermissionMenuSettingsConnector(
      permissionRepository,
      menuRepository,
    );
    const rolePermissionConnector = new RolePermissionConnector(
      roleRepository,
      permissionRepository,
    );

    await permissionRepository.save({
      name: AccessRights.MANAGE_MASTER_DATA,
      description: 'Manage master data',
    });
    const PARENT_MENU_CODE = 'MASTER_DATA';
    const DOMAIN_MENU_CODE = 'DOMAIN';
    const PERIOD_MENU_CODE = 'PERIOD';

    await menuFactory.create([
      {
        name: 'Master data',
        iconCode: 'MASTER_ICON',
        code: PARENT_MENU_CODE,
        subMenus: [
          {
            name: 'Domain',
            accessLink: '/master-data/domains',
            code: DOMAIN_MENU_CODE,
          },
          {
            name: 'Period',
            accessLink: '/master-data/period',
            code: PERIOD_MENU_CODE,
          },
        ],
      },
    ]);

    await permissionMenuSettingsConnector.process({
      permissionCode: AccessRights.MANAGE_MASTER_DATA,
      menuCodes: [PARENT_MENU_CODE, DOMAIN_MENU_CODE, PERIOD_MENU_CODE],
    });
    await rolePermissionConnector.process({
      roleName: SystemRoles.SUPER_ADMIN,
      permissionCodes: [AccessRights.MANAGE_MASTER_DATA],
    });

    await masterDataCommonRepository.insert([
      {
        name: 'IT',
        code: 'SG0001',
        description: 'Information Technology',
      },
      {
        name: 'Design',
        code: 'SG0001',
        description: 'Design',
      },
      {
        name: 'Marketing Online',
        code: 'SG0001',
        description: 'Marketing Online',
      },
    ]);
    await masterDataCommonRepository.insert([
      {
        name: 'Khoá Lập Trình 2020',
        code: 'SG0002',
        description: 'Khoá Lập Trình 2020',
      },
      {
        name: 'Khoá Lập Trình 2021',
        code: 'SG0002',
        description: 'Khoá Lập Trình 2021',
      },
    ]);
  }

  public async down(): Promise<void> {
    return;
  }
}
