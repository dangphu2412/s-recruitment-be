import { User } from '../../../../system/database/entities/user.entity';

export type MyProfile = Pick<User, 'id' | 'username'>;

export type UserDetail = {
  id: string;
  username: string;
  email: string;
  fullName: string;
  trackingId: string;
  birthday: Date;
  phoneNumber: string;
  department?: {
    id: string;
    name: string;
  };
  period?: {
    id: string;
    name: string;
  };
  roles: {
    id: number;
    name: string;
  }[];
  isProbation: boolean;
  createdAt: Date;
  joinedAt: Date;
};
