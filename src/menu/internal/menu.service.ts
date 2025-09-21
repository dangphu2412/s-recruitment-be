import { MenuRepository } from './menu.repositoryt';
import { Inject, Injectable } from '@nestjs/common';
import { MenuService } from '../client';
import { RoleService } from '../../account-service/authorization/interfaces/role-service.interface';
import { Menu } from '../../system/database/entities/menu.entity';

@Injectable()
export class MenuServiceImpl implements MenuService {
  constructor(
    private readonly menuRepository: MenuRepository,
    @Inject(RoleService)
    private readonly roleService: RoleService,
  ) {}

  async findMenusByUserId(userId: string): Promise<Menu[]> {
    const permissionIds =
      await this.roleService.findPermissionsByUserId(userId);

    if (!permissionIds.length) return [];

    return this.menuRepository.findByPermissionCodes(permissionIds);
  }
}
