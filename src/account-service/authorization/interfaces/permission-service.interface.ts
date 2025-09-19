import { Permission } from '../../shared/entities/permission.entity';

export const PermissionService = Symbol('PermissionService');

export interface PermissionService {
  findAll(): Promise<Permission[]>;
}
