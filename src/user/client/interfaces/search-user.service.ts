import { UserManagementView } from '../types/user-management-view.types';
import { UserManagementQuery } from '../dtos/user-management-query.dto';
import { createInterfaceToken } from '../../../utils';

export const SearchUserServiceToken = createInterfaceToken('SearchUserService');

export interface SearchUserService {
  search(query: UserManagementQuery): Promise<UserManagementView>;
}
