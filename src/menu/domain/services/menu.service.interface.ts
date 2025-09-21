import { MenuAggregate } from '../aggregates/menu.aggregate';

export const MenuService = Symbol('MenuService');

export interface MenuService {
  findMenusByUserId(userId: string): Promise<MenuAggregate[]>;
}
