import { createInterfaceToken } from '../../../system/utils';
import { AccessControlView } from '../dtos/core/role-list.dto';
import { Role } from '../../shared/entities/role.entity';
import { UpdateRoleDto } from '../dtos/core/update-role.dto';
import { CreateRoleRequestDTO } from '../dtos/presentation/create-role-request.dto';
import { UpdateAssignedPersonsRequestDTO } from '../dtos/presentation/update-assigned-persons.request';
import { GetAccessControlRequestDTO } from '../dtos/presentation/get-access-control.request';

export const RoleServiceToken = createInterfaceToken('RoleService');

export interface RoleService {
  findAccessControlView(
    dto: GetAccessControlRequestDTO,
  ): Promise<AccessControlView>;
  findByIds(ids: number[]): Promise<Role[]>;
  findPermissionsByUserId(userId: string): Promise<string[]>;
  findByName(name: string): Promise<Role>;
  createRole(createRoleRequestDTO: CreateRoleRequestDTO): Promise<void>;
  updateRole(id: number, dto: UpdateRoleDto): Promise<void>;
  updateAssignedPersonsToRole(
    id: number,
    dto: UpdateAssignedPersonsRequestDTO,
  ): Promise<void>;
  save(userId: string, roles: Role[]): Promise<string[]>;
  clean(userId: string): Promise<void>;
  clean(userIds: string[]): Promise<void>;
}
