import { Role } from '@authorization/client';

export type RoleMapByActiveState = Record<string, boolean>;
export type AccessControlList = RequiredWith<Role, 'permissions'>;
