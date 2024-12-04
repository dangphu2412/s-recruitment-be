import { Department } from '../../data-access/entities/department.entity';
import { createInterfaceToken } from '../../../../system/utils';

export const DepartmentServiceToken = createInterfaceToken('DepartmentService');

export interface DepartmentService {
  findDepartments(): Promise<Department[]>;
}
