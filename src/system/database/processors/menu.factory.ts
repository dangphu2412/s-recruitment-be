import { Menu } from '../../../menu';
import { In, TreeRepository } from 'typeorm';
import { keyBy, omit } from 'lodash';

type InsertMenu = Omit<Menu, 'id' | 'parent' | 'subMenus' | 'parentId'> & {
  subMenus?: InsertMenu[];
};

export class MenuFactory {
  constructor(private readonly menuRepository: TreeRepository<Menu>) {}

  private static excludeSubMenus(
    menu: InsertMenu,
  ): Omit<InsertMenu, 'subMenus'> {
    return menu.subMenus ? omit(menu, 'subMenus') : { ...menu };
  }

  private buildParents(menus: InsertMenu[]) {
    return this.menuRepository.save(menus.map(MenuFactory.excludeSubMenus));
  }

  async create(menus: InsertMenu[]) {
    const createdParent = await this.buildParents(menus);

    const childMenu = await this.menuRepository.save(
      menus
        .map((menu) => {
          return menu.subMenus
            ? menu.subMenus.map((subMenu) =>
                this.menuRepository.create(subMenu),
              )
            : [];
        })
        .flat(),
    );

    const parentKeyByCode = keyBy(createdParent, 'code');
    const childMenuKeyByCode = keyBy(childMenu, 'code');

    await this.menuRepository.save(
      menus.map((menu) => {
        const menuEntity = parentKeyByCode[menu.code];
        if (menu.subMenus) {
          menuEntity.subMenus = menu.subMenus.map((subMenu) => {
            return childMenuKeyByCode[subMenu.code];
          });
        }
        return menuEntity;
      }),
    );
  }

  async terminate(menus: InsertMenu[]) {
    const codes = menus
      .map((menu) => {
        if (menu.subMenus) {
          return menu.subMenus.map((sub) => sub.code);
        }

        return [menu.code];
      })
      .flat();
    await this.menuRepository.delete({
      code: In(codes),
    });
  }
}
