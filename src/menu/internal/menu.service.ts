import { MenuRepository } from './menu.repositoryt';
import { Inject, Injectable } from '@nestjs/common';
import { Menu, MenuService } from '../client';
import keyBy from 'lodash/keyBy';
import {
  RoleService,
  RoleServiceToken,
} from '../../account-service/authorization/interfaces/role-service.interface';

@Injectable()
export class MenuServiceImpl implements MenuService {
  constructor(
    private readonly menuRepository: MenuRepository,
    @Inject(RoleServiceToken)
    private readonly roleService: RoleService,
  ) {}

  async findMenusByUserId(userId: string): Promise<Menu[]> {
    const rights = await this.roleService.findPermissionsByUserId(userId);

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

      const subMenus = menu?.subMenus;

      if (subMenus?.length) {
        if (!permittedMenusKeyByCode[menu.code]) {
          throw new Error(`No menu found: ${menu.code}`);
        }

        menu.subMenus = this.filterMenus(subMenus, permittedMenusKeyByCode);
      }

      return true;
    });
  };
}
