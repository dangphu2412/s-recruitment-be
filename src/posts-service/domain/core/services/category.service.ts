import { createInterfaceToken } from '../../../../system/utils';
import { Category } from '../../data-access/entities/category.entity';

export const CategoryServiceToken = createInterfaceToken(
  'CategoryServiceToken',
);

export interface CategoryService {
  findAll(): Promise<Category[]>;
}
