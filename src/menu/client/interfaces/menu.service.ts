import { Menu } from '../../../system/database/entities/menu.entity';
import { createProviderToken } from '../../../system/nestjs-extensions';

export const MenuServiceToken = createProviderToken('MenuService');

export interface MenuService {
  findMenusByUserId(userId: string): Promise<Menu[]>;
}
