import { In, MigrationInterface, QueryRunner } from 'typeorm';
import { MenuSetting } from '../../menu/client/entities/menu-settings.entity';
import { Permission } from 'src/account-service/authorization/client/entities/permission.entity';
import { AccessRights } from 'src/account-service/authorization/internal/constants/role-def.enum';
import { Menu } from '../../menu';
import keyBy from 'lodash/keyBy';

export class SeedMenuSettings1676171233978 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const permissionRepo = queryRunner.manager.getRepository(Permission);
    const menuRepository = queryRunner.manager.getTreeRepository(Menu);

    const [permissions, menus] = await Promise.all([
      permissionRepo.find({
        where: {
          name: In(Object.values(AccessRights)),
        },
      }),
      menuRepository.findTrees(),
    ]);
    const permissionNameMapToPermission = keyBy(permissions, 'name');
    const menuCodeMapToMenu = this.keyMenusByCode(menus);

    const permissionDefineMenus: Record<string, Array<string>> = {
      [AccessRights.VIEW_USERS]: ['USER_MANAGEMENT', 'ADMIN'],
      [AccessRights.EDIT_MEMBER_USER]: ['ADMIN'],
      [AccessRights.VIEW_ACCESS_RIGHTS]: ['ACCESS_CONTROL'],
      [AccessRights.EDIT_ACCESS_RIGHTS]: ['ACCESS_CONTROL'],
      [AccessRights.MANAGE_RECRUITMENT]: [
        'RECRUITMENT',
        'RECRUITMENT_OVERVIEW',
      ],
    };
    const settings = Object.keys(permissionDefineMenus)
      .map((permissionName) => {
        const permission = permissionNameMapToPermission[permissionName];

        return permissionDefineMenus[permissionName].map((menuName) => {
          const currentMenu = menuCodeMapToMenu[menuName];

          const setting = new MenuSetting();
          setting.menu = currentMenu;
          setting.permission = permission;
          return setting;
        });
      })
      .flat();

    await queryRunner.manager.save(MenuSetting, settings);
  }

  public async down(): Promise<void> {
    return;
  }

  private keyMenusByCode = (
    menus: Menu[],
    results: Record<string, Menu> = {},
  ): Record<string, Menu> => {
    menus.forEach((menu) => {
      results[menu.code] = menu;

      if (menu?.subMenus?.length) {
        this.keyMenusByCode(menu.subMenus, results);
      }
    });

    return results;
  };
}
