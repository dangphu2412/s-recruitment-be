import { In, MigrationInterface, QueryRunner } from 'typeorm';
import { Menu } from '../../menu';
import keyBy from 'lodash/keyBy';
import { Permission } from '../../../account-service/domain/entities/permission.entity';
import { AccessRights } from '../../../account-service/domain/constants/role-def.enum';

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
          name: In([
            AccessRights.VIEW_ACCESS_RIGHTS,
            AccessRights.EDIT_MEMBER_USER,
            AccessRights.VIEW_USERS,
            AccessRights.EDIT_ACCESS_RIGHTS,
          ]),
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
