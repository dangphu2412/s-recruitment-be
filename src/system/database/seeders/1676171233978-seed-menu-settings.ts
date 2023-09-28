import { In, MigrationInterface, QueryRunner } from 'typeorm';
import { Permission } from 'src/account-service/authorization/client/entities/permission.entity';
import { AccessRights } from 'src/account-service/authorization/internal/constants/role-def.enum';
import { Menu } from '../../menu';
import keyBy from 'lodash/keyBy';

export class SeedMenuSettings1676171233978 implements MigrationInterface {
  private keyMenuByCode(menus: Menu[]): Record<string, Menu> {
    return menus.reduce<Record<string, Menu>>((result, currentMenu) => {
      result[currentMenu.code] = currentMenu;

      if (currentMenu.subMenus?.length) {
        return {
          ...result,
          ...this.keyMenuByCode(currentMenu.subMenus),
        };
      }
      return result;
    }, {});
  }

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
    const menuCodeMapToMenu = this.keyMenuByCode(menus);

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

    const linkedEntities = Object.keys(permissionDefineMenus).map(
      (permissionName) => {
        const permission = permissionNameMapToPermission[permissionName];

        if (!permission) {
          throw new Error('Missing permission');
        }

        permission.menuSettings = permissionDefineMenus[permissionName].map(
          (menuCode) => {
            return menuCodeMapToMenu[menuCode];
          },
        );

        return permission;
      },
    );

    await permissionRepo.save(linkedEntities);
  }

  public async down(): Promise<void> {
    return;
  }
}
