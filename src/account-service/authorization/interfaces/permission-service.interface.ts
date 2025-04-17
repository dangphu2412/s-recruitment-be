import { createInterfaceToken } from '../../../system/utils';
import { Permission } from '../../shared/entities/permission.entity';

export const PermissionServiceToken = createInterfaceToken('PermissionService');

export interface PermissionService {
  findAll(): Promise<Permission[]>;
}
