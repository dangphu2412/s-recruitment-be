import { In, MigrationInterface, QueryRunner } from 'typeorm';
import keyBy from 'lodash/keyBy';
import { Permission } from 'src/account-service/domain/entities/permission.entity';
import {
  AccessRights,
  SystemRoles,
} from 'src/account-service/domain/constants/role-def.enum';
import { Role } from '../../../account-service/domain/entities/role.entity';

export class SeedRoles1657339599214 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const roleRepository = queryRunner.manager.getRepository(Role);
    const permissionRepository = queryRunner.manager.getRepository(Permission);

    const savedRoles = await roleRepository.save([
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
        name: SystemRoles.TRAINER,
        description:
          'User who is the trainer of a domain or group, can view and edit users',
      },
      {
        name: SystemRoles.MEMBER,
        description: 'Member in the system',
      },
    ]);
    const savedPermissions = await permissionRepository.save([
      {
        name: AccessRights.VIEW_ACCESS_RIGHTS,
        description: 'View access rights of system',
      },
      {
        name: AccessRights.EDIT_MEMBER_USER,
        description: 'Modify member user',
      },
      {
        name: AccessRights.VIEW_USERS,
        description: 'View users of system',
      },
      {
        name: AccessRights.EDIT_ACCESS_RIGHTS,
        description: 'Edit roles of system',
      },
      {
        name: AccessRights.READ_ASSESSMENTS,
        description: 'Read assessments',
      },
      {
        name: AccessRights.WRITE_ASSESSMENTS,
        description: 'Write assessments',
      },
      {
        name: AccessRights.READ_USER_GROUPS,
        description: 'Read user groups',
      },
      {
        name: AccessRights.WRITE_USER_GROUPS,
        description: 'Write user groups',
      },
    ]);
    const nameMapToRoles = keyBy(savedRoles, 'name');
    const nameMapToPermissions = keyBy(savedPermissions, 'name');

    const roleNameMapToPermissionNames = {
      [SystemRoles.SUPER_ADMIN]: [
        AccessRights.VIEW_USERS,
        AccessRights.EDIT_MEMBER_USER,
        AccessRights.EDIT_ACCESS_RIGHTS,
        AccessRights.VIEW_ACCESS_RIGHTS,
        AccessRights.READ_ASSESSMENTS,
        AccessRights.WRITE_ASSESSMENTS,
        AccessRights.READ_USER_GROUPS,
        AccessRights.WRITE_USER_GROUPS,
      ],
      [SystemRoles.LEADER]: [
        AccessRights.VIEW_USERS,
        AccessRights.EDIT_MEMBER_USER,
      ],
      [SystemRoles.TRAINER]: [
        AccessRights.VIEW_USERS,
        AccessRights.EDIT_MEMBER_USER,
      ],
      [SystemRoles.MEMBER]: [],
    };

    await roleRepository.save(
      Object.keys(roleNameMapToPermissionNames).map((roleName) => {
        const role = nameMapToRoles[roleName];

        role.permissions = roleNameMapToPermissionNames[roleName].map(
          (permissionName: string | number) =>
            nameMapToPermissions[permissionName],
        );

        return role;
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
