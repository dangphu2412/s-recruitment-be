import { In, Repository, TreeRepository } from 'typeorm';
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

  findByPermissionNames(names: string[]): Promise<Menu[]> {
    return this.find({
      relations: {
        permissionSettings: true,
      },
      where: {
        permissionSettings: {
          name: In(names),
        },
      },
    });
  }
}
