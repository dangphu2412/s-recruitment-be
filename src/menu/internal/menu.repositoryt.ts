import { EntityRepository, TreeRepository } from 'typeorm';
import { Menu } from '../client';

@EntityRepository(Menu)
export class MenuRepository extends TreeRepository<Menu> {
  findByPermissionNames(names: string[]): Promise<Menu[]> {
    return this.createQueryBuilder('menus')
      .leftJoinAndSelect('menus.settings', 'settings')
      .leftJoinAndSelect('settings.permission', 'permission')
      .andWhere('permission.name IN (:...names)', { names })
      .getMany();
  }
}
