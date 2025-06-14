import { OffsetPaginationRequest } from 'src/system/pagination/offset-pagination-request';

type CreatePage<T, Q> = {
  items: T[];
  totalRecords: number;
  query: Q;
};

type OffsetPaginationMetadata = {
  page: number;
  size: number;
  totalRecords: number;
  totalPages: number;
};

export class OffsetPaginationResponse<T> {
  items: T[];
  metadata: OffsetPaginationMetadata;

  static of<T, Q extends OffsetPaginationRequest>({
    query,
    items,
    totalRecords,
  }: CreatePage<T, Q>): OffsetPaginationResponse<T> {
    const totalPages = Math.ceil(totalRecords / query.size);

    const metadata: OffsetPaginationMetadata = {
      size: query.size,
      page: query.page,
      totalRecords,
      totalPages,
    };
    const page = new OffsetPaginationResponse<T>();
    page.items = items;
    page.metadata = metadata;

    return page;
  }
}
