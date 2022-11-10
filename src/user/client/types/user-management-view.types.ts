import { User } from '../entities/user.entity';
import { Page } from '../../../shared/query-shape/pagination/types';

export type UserManagementView = Page<Omit<User, 'password' | 'roles'>[]>;
