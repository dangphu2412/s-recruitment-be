import { CreatePage, Page } from '../types';
import { createPaginationMetadata } from './pagination-metadata.factory';
import { OffsetPagination } from '../entities/offset-pagination.request';

export function createPage<T, Q extends OffsetPagination>(
  createPageReq: CreatePage<T, Q>,
): Page<T> {
  return {
    items: createPageReq.items,
    metadata: createPaginationMetadata({
      size: createPageReq.query.size,
      page: createPageReq.query.page,
      totalRecords: createPageReq.totalRecords,
    }),
  };
}
