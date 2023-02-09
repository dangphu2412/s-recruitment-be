import { Permission } from '@authorization/client/entities/permission.entity';

export type Right = Permission & { canAccess: boolean };
export type AccessControlList = {
  access: {
    id: string;
    name: string;
    description: string;
    isEditable: boolean;
    rights: Right[];
  }[];
};
