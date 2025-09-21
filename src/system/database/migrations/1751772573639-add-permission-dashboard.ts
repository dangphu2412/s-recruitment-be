import { MigrationInterface, QueryRunner } from 'typeorm';
import { Permission } from '../entities/permission.entity';
import { Permissions } from '../../../account-service/authorization/access-definition.constant';
import { Menu } from '../../../menu';
import { MenuCode } from '../../../menu/client/menu-code.constant';
import { PermissionMenuSettingsConnector } from '../processors/permission-menu-settings.connector';

export class AddPermissionDashboard1751772573639 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const permissionRepository = queryRunner.manager.getRepository(Permission);
    await permissionRepository.insert([
      {
        name: 'Read KPI',
        code: Permissions.READ_KPI,
        description: 'Read KPI of all members',
      },
    ]);

    const menuTreeRepository = queryRunner.manager.getTreeRepository(Menu);

    const rootUserMenu = await menuTreeRepository.findOne({
      where: {
        id: MenuCode.USER_MANAGEMENT,
      },
      relations: ['subMenus'],
    });
    const userPaymentMenu = await menuTreeRepository.save({
      id: MenuCode.USER_PAYMENTS,
      name: 'Payments',
      accessLink: '/users/payments',
    });
    rootUserMenu.subMenus.push(userPaymentMenu);

    await menuTreeRepository.save(rootUserMenu);

    const menuSettingsProcessor = new PermissionMenuSettingsConnector(
      permissionRepository,
      queryRunner.manager,
    );

    await menuSettingsProcessor.process({
      [MenuCode.USER_PAYMENTS]: [Permissions.READ_PAYMENTS],
    });
  }

  public async down(): Promise<void> {
    return;
  }
}
