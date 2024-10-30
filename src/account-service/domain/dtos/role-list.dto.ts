import { Permission } from 'src/account-service/domain/data-access/entities/permission.entity';
import { Role } from '../data-access/entities/role.entity';

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
