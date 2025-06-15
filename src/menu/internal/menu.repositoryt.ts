import { Repository, TreeRepository } from 'typeorm';
import { Menu } from '../client';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MenuRepository extends TreeRepository<Menu> {
  constructor(
    @InjectRepository(Menu)
    repository: Repository<Menu>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  async findByPermissionCodes(permissionCode: string[]): Promise<Menu[]> {
    const trees = await this.findTrees({
      relations: ['permissionSettings'],
    });

    return trees.filter((tree) => {
      tree.subMenus = tree.subMenus.filter((leaf) => {
        return permissionCode.some((permissionCode) =>
          leaf.permissionSettings.some(
            (setting) => setting.code === permissionCode,
          ),
        );
      });

      return tree.subMenus.length > 0;
    });
  }
}
