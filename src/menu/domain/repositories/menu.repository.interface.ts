import { MenuAggregate } from '../aggregates/menu.aggregate';

export const MenuRepository = Symbol('MenuRepository');

export interface MenuRepository {
  findByGrantedAccessCodes(permissionIds: string[]): Promise<MenuAggregate[]>;
}
