import { EntityManager, In, Repository } from 'typeorm';
import { Permission } from '../../../account-service/shared/entities/permission.entity';

type MenuKey = string;
type MenuSettings = Record<MenuKey, Array<string>>;

export class PermissionMenuSettingsConnector {
  constructor(
    private readonly permissionRepository: Repository<Permission>,
    private readonly manager: EntityManager,
  ) {}

  async process(settings: MenuSettings) {
    const batches: string[] = [];

    await Promise.all(
      Object.keys(settings).map(async (menuKey) => {
        const permissions = await this.permissionRepository.find({
          where: {
            code: In(settings[menuKey] as string[]),
          },
        });

        permissions.forEach((permission) => {
          batches.push(
            `INSERT INTO menu_settings(menu_id, permission_id) VALUES ('${menuKey}', '${permission.id}')`,
          );
        });
      }),
    );

    await this.manager.query(batches.join(';'));
  }
}
