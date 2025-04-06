import { Permission } from 'src/account-service/shared/entities/permission.entity';

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
