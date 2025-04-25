import { createProviderToken } from '../../../system/nestjs-extensions';
import { Permission } from '../../shared/entities/permission.entity';

export const PermissionServiceToken = createProviderToken('PermissionService');

export interface PermissionService {
  findAll(): Promise<Permission[]>;
}
