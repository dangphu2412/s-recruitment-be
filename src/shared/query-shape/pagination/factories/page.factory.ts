import { CreatePage, Page, PaginationMetadata } from '../types';
import { OffsetPagination } from '../entities/offset-pagination.request';

export function createPage<T, Q extends OffsetPagination>({
  query,
  items,
  totalRecords,
}: CreatePage<T, Q>): Page<T> {
  const totalPages = Math.ceil(totalRecords / query.size);

  const metadata: PaginationMetadata = {
    size: query.size,
    page: query.page,
    totalRecords,
    totalPages,
  };

  return {
    items,
    metadata,
  };
}
