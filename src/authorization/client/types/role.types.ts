import { Role } from '@authorization/client';
import { Permission } from '@authorization/client/entities/permission.entity';

export type RoleMapByActiveState = Record<string, boolean>;
export type RoleOverview = Omit<Role, 'permissions' | 'users'>[];
export type AccessControlList = {
  rights: (Permission & { canAccess: boolean })[];
};
