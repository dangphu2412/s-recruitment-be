import { Permission } from '../../../system/database/entities/permission.entity';

export const PermissionService = Symbol('PermissionService');

export interface PermissionService {
  findAll(): Promise<Permission[]>;
}
