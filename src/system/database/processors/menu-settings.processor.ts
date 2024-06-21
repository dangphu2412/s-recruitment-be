import { Permission } from '../../../account-service/domain/entities/permission.entity';
import { In, Repository } from 'typeorm';
import { Menu } from '../../menu';

type MenuSettings = {
  permissionCode: string;
  menuCodes: string[];
};

export class MenuSettingsProcessor {
  constructor(
    private readonly permissionRepository: Repository<Permission>,
    private readonly menuRepository: Repository<Menu>,
  ) {}

  async process({ permissionCode, menuCodes }: MenuSettings) {
    const postPermission = await this.permissionRepository.findOne({
      where: {
        name: permissionCode,
      },
      relations: ['menuSettings'],
    });

    const newMenu = await this.menuRepository.findBy({
      code: In(menuCodes),
    });

    postPermission.menuSettings = postPermission.menuSettings.concat(newMenu);

    await this.permissionRepository.save(postPermission);
  }
}
