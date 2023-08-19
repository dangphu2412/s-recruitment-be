import { MenuRepository } from './menu.repositoryt';
import { Inject, Injectable } from '@nestjs/common';
import { Menu, MenuService } from '../client';
import {
  AccessRights,
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

    // Hard code for menu manage recruitment
    const unionRights = [...rights, AccessRights.MANAGE_RECRUITMENT];

    const [allMenus, permittedMenus] = await Promise.all([
      this.menuRepository.findTrees(),
      this.menuRepository.findByPermissionNames(unionRights),
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
