import { MigrationInterface, QueryRunner } from 'typeorm';
import { Menu } from '../../menu';
import { MenuFactory } from '../processors/menu.factory';
import { Permission } from '../../../account-service/domain/entities/permission.entity';
import {
  AccessRights,
  SystemRoles,
} from '../../../account-service/domain/constants/role-def.enum';
import { Role } from '../../../account-service/domain/entities/role.entity';
import { PermissionMenuSettingsConnector } from '../processors/permission-menu-settings.connector';
import { RolePermissionConnector } from '../processors/role-permission.connector';

export class AddPostMenu1718898940035 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const menuRepository = queryRunner.manager.getTreeRepository(Menu);
    const permissionRepository = queryRunner.manager.getRepository(Permission);
    const roleRepository = queryRunner.manager.getRepository(Role);
    const menuProcessor = new MenuFactory(menuRepository);
    const menuSettingsProcessor = new PermissionMenuSettingsConnector(
      permissionRepository,
      menuRepository,
    );
    const rolePermissionProcessor = new RolePermissionConnector(
      roleRepository,
      permissionRepository,
    );

    await permissionRepository.save({
      name: AccessRights.MANAGE_POSTS,
      description: 'Manage public posts of S-Group',
    });

    await menuProcessor.create([
      {
        name: 'Posts',
        iconCode: 'POST_ICON',
        code: 'POST',
        subMenus: [
          {
            name: 'Post management',
            accessLink: '/posts/overview',
            code: 'POSTS_OVERVIEW',
          },
        ],
      },
    ]);

    await menuSettingsProcessor.process({
      permissionCode: AccessRights.MANAGE_POSTS,
      menuCodes: ['POSTS_OVERVIEW', 'POST'],
    });
    await rolePermissionProcessor.process({
      roleName: SystemRoles.CHAIRMAN,
      permissionCodes: [AccessRights.MANAGE_POSTS],
    });
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const menuRepository = queryRunner.manager.getTreeRepository(Menu);
    const permissionRepository = queryRunner.manager.getRepository(Permission);
    const roleRepository = queryRunner.manager.getRepository(Role);
    const menuProcessor = new MenuFactory(menuRepository);

    // unlink role and permission
    const chairman = await roleRepository.findOneOrFail({
      where: {
        name: SystemRoles.CHAIRMAN,
      },
      relations: ['permissions'],
    });
    chairman.permissions = [];
    await roleRepository.save(chairman);

    // unlink menu and permission
    const postPermission = await permissionRepository.findOneOrFail({
      where: {
        name: AccessRights.MANAGE_POSTS,
      },
      relations: ['menuSettings'],
    });

    postPermission.menuSettings = [];
    await permissionRepository.save(postPermission);
    await menuProcessor.terminate([
      {
        name: 'Posts',
        iconCode: 'POST_ICON',
        code: 'POST',
        subMenus: [
          {
            name: 'Post management',
            accessLink: '/posts/overview',
            code: 'POSTS_OVERVIEW',
          },
        ],
      },
    ]);

    await permissionRepository.delete({
      name: AccessRights.MANAGE_POSTS,
    });
  }
}
