import { User } from '../entities/user.entity';

export type MyProfile = Pick<User, 'id' | 'username'>;

export type UserDetail = {
  id: string;
  username: string;
  domain?: {
    id: number;
    name: string;
  };
  period?: {
    id: number;
    name: string;
  };
  roles: {
    id: string;
    name: string;
  }[];
  isProbation: boolean;
  createdAt: Date;
};
