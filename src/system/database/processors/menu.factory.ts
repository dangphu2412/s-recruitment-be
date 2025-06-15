import { Menu } from '../../../menu';
import { TreeRepository } from 'typeorm';
import { keyBy, omit } from 'lodash';

type InsertMenu = Omit<Menu, 'parent' | 'subMenus' | 'parentId'> & {
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

    const parentKeyByCode = keyBy(createdParent, 'id');
    const childMenuKeyByCode = keyBy(childMenu, 'id');

    await this.menuRepository.save(
      menus.map((menu) => {
        const menuEntity = parentKeyByCode[menu.id];
        if (menu.subMenus) {
          menuEntity.subMenus = menu.subMenus.map((subMenu) => {
            return childMenuKeyByCode[subMenu.id];
          });
        }
        return menuEntity;
      }),
    );
  }
}
