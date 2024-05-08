import { In, MigrationInterface, QueryRunner } from 'typeorm';
import { MenuProcessor } from '../processors/menu.processor';
import { Menu } from '../../menu';
import { Permission } from '../../../account-service/domain/entities/permission.entity';
import { AccessRights } from '../../../account-service/domain/constants/role-def.enum';

export class ModifyEventMenu1695533316729 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const menuRepository = queryRunner.manager.getTreeRepository(Menu);

    const menuProcessor = new MenuProcessor(menuRepository);

    await menuProcessor.process([
      {
        name: 'Event',
        iconCode: 'RECRUITMENT_ICON',
        code: 'EVENT',
        subMenus: [
          {
            name: 'Recruitment Overview',
            accessLink: '/recruitments/overview',
            code: 'RECRUITMENT_OVERVIEW',
          },
        ],
      },
    ]);

    const menus = await menuRepository.find({
      where: {
        name: In(['Recruitment', 'Recruitment management']),
      },
      relations: {
        permissionSettings: true,
      },
    });

    menus.forEach((menu) => {
      menu.permissionSettings = [];
    });

    await menuRepository.save(menus);
    await menuRepository.remove(menus);

    const permissionRepo = queryRunner.manager.getRepository(Permission);
    const linkedPermission = await permissionRepo.findOne({
      where: {
        name: AccessRights.MANAGE_RECRUITMENT,
      },
    });

    linkedPermission.menuSettings = await menuRepository.find({
      where: {
        code: In(['EVENT', 'RECRUITMENT_OVERVIEW']),
      },
    });

    await permissionRepo.save(linkedPermission);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const menuRepository = queryRunner.manager.getTreeRepository(Menu);
    const menuProcessor = new MenuProcessor(menuRepository);

    await menuProcessor.terminate([
      {
        name: 'Event',
        iconCode: 'RECRUITMENT_ICON',
        code: 'EVENT',
        subMenus: [
          {
            name: 'Recruitment Overview',
            accessLink: '/recruitments/overview',
            code: 'RECRUITMENT_OVERVIEW',
          },
        ],
      },
    ]);
    await menuProcessor.process([
      {
        name: 'Recruitment',
        iconCode: 'RECRUITMENT_ICON',
        code: 'RECRUITMENT',
        subMenus: [
          {
            name: 'Recruitment management',
            accessLink: '/recruitments/overview',
            code: 'RECRUITMENT_OVERVIEW',
          },
        ],
      },
    ]);
  }
}
