import { In, MigrationInterface, QueryRunner } from 'typeorm';
import { Permission } from 'src/account-service/domain/data-access/entities/permission.entity';
import {
  Permissions,
  SystemRoles,
} from 'src/account-service/domain/constants/role-def.enum';
import { Role } from '../../../account-service/domain/data-access/entities/role.entity';
import { RolePermissionConnector } from '../processors/role-permission.connector';

export class SeedRoles1657339599214 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const roleRepository = queryRunner.manager.getRepository(Role);
    const permissionRepository = queryRunner.manager.getRepository(Permission);

    const rolePermissionConnector = new RolePermissionConnector(
      roleRepository,
      permissionRepository,
    );

    await roleRepository.insert([
      {
        name: SystemRoles.SUPER_ADMIN,
        description: 'The highest role in the system',
        isEditable: false,
      },
      {
        name: SystemRoles.HR,
        description: 'User who charge of manage resource of organization',
      },
      {
        name: SystemRoles.LEADER,
        description: 'User who is the leader of a domain or group',
      },
      {
        name: SystemRoles.MEDIA,
        description: 'User who is in media team',
      },
      {
        name: SystemRoles.TRAINER,
        description:
          'User who is the trainer of a domain or group, can view and edit users',
      },
      {
        name: SystemRoles.MEMBER,
        description: 'Member in the system',
      },
    ]);
    await permissionRepository.insert([
      {
        name: Permissions.VIEW_ACCESS_RIGHTS,
        description: 'View access rights of system',
      },
      {
        name: Permissions.EDIT_MEMBER_USER,
        description: 'Modify member user',
      },
      {
        name: Permissions.VIEW_USERS,
        description: 'View users of system',
      },
      {
        name: Permissions.EDIT_ACCESS_RIGHTS,
        description: 'Edit roles of system',
      },
      {
        name: Permissions.READ_ASSESSMENTS,
        description: 'Read assessments',
      },
      {
        name: Permissions.WRITE_ASSESSMENTS,
        description: 'Write assessments',
      },
      {
        name: Permissions.READ_USER_GROUPS,
        description: 'Read user groups',
      },
      {
        name: Permissions.WRITE_USER_GROUPS,
        description: 'Write user groups',
      },
      {
        name: Permissions.MANAGE_RECRUITMENT,
        description: 'Manage recruitment',
      },
      {
        name: Permissions.MANAGE_POSTS,
        description: 'Manage public posts of S-Group',
      },
      {
        name: Permissions.MANAGE_MASTER_DATA,
        description: 'Manage master data',
      },
    ]);

    const roleNameMapToPermissionNames = {
      [SystemRoles.SUPER_ADMIN]: [
        Permissions.VIEW_USERS,
        Permissions.EDIT_MEMBER_USER,
        Permissions.EDIT_ACCESS_RIGHTS,
        Permissions.VIEW_ACCESS_RIGHTS,
        Permissions.READ_ASSESSMENTS,
        Permissions.WRITE_ASSESSMENTS,
        Permissions.READ_USER_GROUPS,
        Permissions.WRITE_USER_GROUPS,
        Permissions.MANAGE_RECRUITMENT,
        Permissions.MANAGE_MASTER_DATA,
        Permissions.WRITE_WORKING,
        Permissions.READ_WORKING,
        Permissions.MANAGE_POSTS,
      ],
      [SystemRoles.LEADER]: [
        Permissions.VIEW_USERS,
        Permissions.EDIT_MEMBER_USER,
      ],
      [SystemRoles.TRAINER]: [
        Permissions.VIEW_USERS,
        Permissions.EDIT_MEMBER_USER,
      ],
      [SystemRoles.MEDIA]: [
        Permissions.VIEW_USERS,
        Permissions.EDIT_MEMBER_USER,
      ],
      [SystemRoles.HR]: [Permissions.VIEW_USERS, Permissions.EDIT_MEMBER_USER],
      [SystemRoles.MEMBER]: [],
    };

    await Promise.all(
      Object.keys(roleNameMapToPermissionNames).map((roleName) => {
        rolePermissionConnector.process({
          roleName: roleName,
          permissionCodes: roleNameMapToPermissionNames[roleName],
        });
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const roleRepository = queryRunner.manager.getRepository(Role);
    await roleRepository.delete({
      name: In(Object.values(SystemRoles)),
    });
  }
}
