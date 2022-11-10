export type PaginationMetadata = {
  page: number;
  size: number;
  totalRecords: number;
  totalPages: number;
};
export type CreatePaginationMetadata = Omit<PaginationMetadata, 'totalPages'>;

export type Page<T> = {
  items: T;
  metadata: PaginationMetadata;
};
export type CreatePage<T, Q> = {
  items: T;
  totalRecords: number;
  query: Q;
};
