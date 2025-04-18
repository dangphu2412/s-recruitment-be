import { Permission } from 'src/account-service/shared/entities/permission.entity';

export type Right = Permission & { canAccess: boolean };
export type AccessControlView = {
  access: {
    id: number;
    name: string;
    description: string;
    isEditable: boolean;
    totalUsers?: number;
    rights: Right[];
  }[];
};
