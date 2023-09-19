import { User } from '../../../user';

export type MyProfile = Pick<User, 'id' | 'username'>;

export type UserDetail = User;
