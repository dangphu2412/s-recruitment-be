import { Inject, Injectable } from '@nestjs/common';
import { RoleService } from '../../account-service/authorization/interfaces/role-service.interface';
import { MenuService } from '../domain/services/menu.service.interface';
import { MenuAggregate } from '../domain/aggregates/menu.aggregate';
import { MenuRepository } from '../domain/repositories/menu.repository.interface';

@Injectable()
export class MenuServiceImpl implements MenuService {
  constructor(
    @Inject(MenuRepository)
    private readonly menuRepository: MenuRepository,
    @Inject(RoleService)
    private readonly roleService: RoleService,
  ) {}

  async findMenusByUserId(userId: string): Promise<MenuAggregate[]> {
    const permissionIds =
      await this.roleService.findPermissionsByUserId(userId);

    if (!permissionIds.length) {
      return [];
    }

    return this.menuRepository.findByGrantedAccessCodes(permissionIds);
  }
}
