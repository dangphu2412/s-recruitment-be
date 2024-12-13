import { User } from '../data-access/entities/user.entity';

export type MyProfile = Pick<User, 'id' | 'username'>;

export type UserDetail = {
  id: string;
  username: string;
  email: string;
  fullName: string;
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
    id: string;
    name: string;
  }[];
  isProbation: boolean;
  createdAt: Date;
};
