import { Menu } from '../entities/menu.entity';
import { createInterfaceToken } from '../../../utils';

export const MenuServiceToken = createInterfaceToken('MenuService');

export interface MenuService {
  findMenusByUserId(userId: string): Promise<Menu[]>;
}
