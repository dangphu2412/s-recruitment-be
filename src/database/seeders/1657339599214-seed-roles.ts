import { In, MigrationInterface, QueryRunner } from 'typeorm';
import { SystemRoles, Role, AccessRights } from '../../authorization';
import { Permission } from '@authorization/client/entities/permission.entity';
import keyBy from 'lodash/keyBy';

export class SeedRoles1657339599214 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const roleRepository = queryRunner.manager.getRepository(Role);
    const permissionRepository = queryRunner.manager.getRepository(Permission);

    const savedRoles = await roleRepository.save([
      {
        name: SystemRoles.CHAIRMAN,
        description: 'Chairman of group',
      },
      {
        name: SystemRoles.DOMAIN_CHIEF,
        description: 'User who is the chief of a domain knowledge in group',
      },
      {
        name: SystemRoles.DOMAIN_LEADER,
        description:
          'User who is the leader of a domain knowledge in group, support chief',
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
    ]);
    const nameMapToRoles = keyBy(savedRoles, 'name');
    const nameMapToPermissions = keyBy(savedPermissions, 'name');

    const roleNameMapToPermissionNames = {
      [SystemRoles.CHAIRMAN]: Object.values(AccessRights),
      [SystemRoles.DOMAIN_CHIEF]: [
        AccessRights.VIEW_USERS,
        AccessRights.EDIT_MEMBER_USER,
      ],
      [SystemRoles.DOMAIN_LEADER]: [
        AccessRights.VIEW_USERS,
        AccessRights.EDIT_MEMBER_USER,
      ],
      [SystemRoles.MEMBER]: [],
    };

    await roleRepository.save(
      Object.keys(roleNameMapToPermissionNames).map((roleName) => {
        const role = nameMapToRoles[roleName];

        role.permissions = roleNameMapToPermissionNames[roleName].map(
          (permissionName) => nameMapToPermissions[permissionName],
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
