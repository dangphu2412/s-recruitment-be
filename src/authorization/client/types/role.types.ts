import { Permission } from '@authorization/client/entities/permission.entity';
import { Role } from '@authorization/client';

export type Right = Permission & { canAccess: boolean };
export type AccessControlView = {
  access: {
    id: string;
    name: string;
    description: string;
    isEditable: boolean;
    rights: Right[];
  }[];
};

export type AccessControlList = (Required<Pick<Role, 'permissions'>> &
  Omit<Role, 'permissions'>)[];
