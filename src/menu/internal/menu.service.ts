import { MenuRepository } from './menu.repositoryt';
import { Inject, Injectable } from '@nestjs/common';
import { Menu, MenuService } from '../client';
import {
  AccessRightStorage,
  AccessRightStorageToken,
  RoleService,
  RoleServiceToken,
} from 'src/authorization/client';
import keyBy from 'lodash/keyBy';

@Injectable()
export class MenuServiceImpl implements MenuService {
  constructor(
    private readonly menuRepository: MenuRepository,
    @Inject(AccessRightStorageToken)
    private readonly accessRightStorage: AccessRightStorage,
    @Inject(RoleServiceToken)
    private readonly roleService: RoleService,
  ) {}

  async findMenusByUserId(userId: string): Promise<Menu[]> {
    const rights = await this.accessRightStorage.get(userId);

    if (!rights.length) return [];

    const [allMenus, permittedMenus] = await Promise.all([
      this.menuRepository.findTrees(),
      this.menuRepository.findByPermissionNames(rights),
    ]);
    const permittedMenusKeyByCode = keyBy(permittedMenus, 'code');

    return this.filterMenus(allMenus, permittedMenusKeyByCode);
  }

  private filterMenus = (
    menus: Menu[],
    permittedMenusKeyByCode: Record<string, Menu>,
  ) => {
    return menus.filter((menu) => {
      if (!permittedMenusKeyByCode[menu.code]) {
        return false;
      }

      const subMenus = permittedMenusKeyByCode[menu.code].subMenus;

      if (subMenus?.length) {
        permittedMenusKeyByCode[menu.code].subMenus = this.filterMenus(
          subMenus,
          permittedMenusKeyByCode,
        );
      }

      return true;
    });
  };
}
