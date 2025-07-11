import { MenuRepository } from './menu.repositoryt';
import { Inject, Injectable } from '@nestjs/common';
import { Menu, MenuService } from '../client';
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
    const permissionIds =
      await this.roleService.findPermissionsByUserId(userId);

    if (!permissionIds.length) return [];

    return this.menuRepository.findByPermissionCodes(permissionIds);
  }
}
