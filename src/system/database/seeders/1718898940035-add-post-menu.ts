import { MigrationInterface, QueryRunner } from 'typeorm';
import { Menu } from '../../menu';
import { MenuProcessor } from '../processors/menu.processor';
import { Permission } from '../../../account-service/domain/entities/permission.entity';
import {
  AccessRights,
  SystemRoles,
} from '../../../account-service/domain/constants/role-def.enum';
import { Role } from '../../../account-service/domain/entities/role.entity';
import { MenuSettingsProcessor } from '../processors/menu-settings.processor';
import { RolePermissionProcessor } from '../processors/role-permission.processor';

export class AddPostMenu1718898940035 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const menuRepository = queryRunner.manager.getTreeRepository(Menu);
    const permissionRepository = queryRunner.manager.getRepository(Permission);
    const roleRepository = queryRunner.manager.getRepository(Role);
    const menuProcessor = new MenuProcessor(menuRepository);
    const menuSettingsProcessor = new MenuSettingsProcessor(
      permissionRepository,
      menuRepository,
    );
    const rolePermissionProcessor = new RolePermissionProcessor(
      roleRepository,
      permissionRepository,
    );

    await permissionRepository.save({
      name: AccessRights.MANAGE_POSTS,
      description: 'Manage public posts of S-Group',
    });

    await menuProcessor.process([
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
    const menuProcessor = new MenuProcessor(menuRepository);

    // unlink role and permission
    const chairman = await roleRepository.findOne({
      where: {
        name: SystemRoles.CHAIRMAN,
      },
      relations: ['permissions'],
    });
    chairman.permissions = [];
    await roleRepository.save(chairman);

    // unlink menu and permission
    const postPermission = await permissionRepository.findOne({
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
