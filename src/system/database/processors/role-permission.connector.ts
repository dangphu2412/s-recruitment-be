import { Permission } from '../../../account-service/shared/entities/permission.entity';
import { In, Repository } from 'typeorm';
import { Role } from '../../../account-service/shared/entities/role.entity';

type MenuSettings = {
  roleName: string;
  permissionCodes: string[];
};

export class RolePermissionConnector {
  constructor(
    private readonly roleRepository: Repository<Role>,
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async process({ roleName, permissionCodes }: MenuSettings) {
    const role = await this.roleRepository.findOne({
      where: {
        name: roleName,
      },
      relations: ['permissions'],
    });

    const newPermission = await this.permissionRepository.findBy({
      code: In(permissionCodes),
    });
    role.permissions = role.permissions.concat(newPermission);

    await this.roleRepository.save(role);
  }
}
