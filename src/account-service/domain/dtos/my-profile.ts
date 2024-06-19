import { User } from '../entities/user.entity';

export type MyProfile = Pick<User, 'id' | 'username'>;

export type UserDetail = User;
