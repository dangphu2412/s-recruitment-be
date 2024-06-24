import { createInterfaceToken } from '../../../system/utils';
import { Category } from '../entities/category.entity';

export const CategoryServiceToken = createInterfaceToken(
  'CategoryServiceToken',
);

export interface CategoryService {
  getAll(): Promise<Category[]>;
}
