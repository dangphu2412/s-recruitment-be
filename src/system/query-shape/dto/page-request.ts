import { OffsetPagination } from 'src/system/query-shape/dto/offset-pagination.request';
import { PageRequest as IPageRequest } from 'src/system/query-shape/types';

export class PageRequest {
  static of({ size, page }: OffsetPagination): IPageRequest {
    return {
      size,
      page,
      offset: (page - 1) * size,
    };
  }
}
