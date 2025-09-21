import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { MenuRepository } from '../domain/repositories/menu.repository.interface';
import { MenuAggregate } from '../domain/aggregates/menu.aggregate';
import { Menu } from '../../system/database/entities/menu.entity';

@Injectable()
export class MenuRepositoryImpl implements MenuRepository {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async findByGrantedAccessCodes(
    permissionIds: string[],
  ): Promise<MenuAggregate[]> {
    const parentMenus = await this.dataSource
      .getTreeRepository(Menu)
      .findTrees({
        relations: ['permissionSettings'],
      });

    const permissionIdsMap = new Map<string, boolean>(
      permissionIds.map((id) => [id, true]),
    );

    return parentMenus
      .filter((parentMenu) => {
        function isMenuGrantedAccess(leaf: Menu): boolean {
          return leaf.permissionSettings.some((setting) =>
            permissionIdsMap.has(setting.code),
          );
        }

        parentMenu.subMenus = parentMenu.subMenus.filter(isMenuGrantedAccess);

        return parentMenu.subMenus.length > 0;
      })
      .map(MenuRepositoryImpl.fromEntityToDomain);
  }

  static fromEntityToDomain(entity: Menu): MenuAggregate {
    const aggregate = new MenuAggregate();
    aggregate.id = entity.id;
    aggregate.name = entity.name;
    aggregate.iconCode = entity.iconCode;
    aggregate.accessLink = entity.accessLink;
    aggregate.subMenus = entity.subMenus
      ? entity.subMenus.map(MenuRepositoryImpl.fromEntityToDomain)
      : null;

    return aggregate;
  }
}
