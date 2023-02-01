import { Permission } from '@authorization/client/entities/permission.entity';

export type RoleMapByActiveState = Record<string, boolean>;
export type Right = Permission & { canAccess: boolean };
export type AccessControlList = {
  access: {
    name: string;
    rights: Right[];
  }[];
};
