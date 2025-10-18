import { OffsetPaginationRequest } from 'src/system/pagination/offset-pagination-request';
import { OffsetPaginationResponse } from '../../../src/system/pagination';

describe('OffsetPaginationResponse', () => {
  it('should create response with correct metadata', () => {
    const query: OffsetPaginationRequest = { page: 2, size: 5 };
    const items = [1, 2, 3, 4, 5];
    const totalRecords = 23;

    const response = OffsetPaginationResponse.of({
      query,
      items,
      totalRecords,
    });

    expect(response.items).toEqual(items);
    expect(response.metadata).toEqual({
      page: 2,
      size: 5,
      totalRecords: 23,
      totalPages: Math.ceil(totalRecords / query.size), // should be 5
    });
  });

  it('should handle exact division of records by size', () => {
    const query: OffsetPaginationRequest = { page: 1, size: 10 };
    const items = Array.from({ length: 10 }, (_, i) => i + 1);
    const totalRecords = 20;

    const response = OffsetPaginationResponse.of({
      query,
      items,
      totalRecords,
    });

    expect(response.metadata.totalPages).toBe(2);
  });

  it('should handle case with fewer records than page size', () => {
    const query: OffsetPaginationRequest = { page: 1, size: 10 };
    const items = [1, 2, 3];
    const totalRecords = 3;

    const response = OffsetPaginationResponse.of({
      query,
      items,
      totalRecords,
    });

    expect(response.metadata.totalPages).toBe(1);
    expect(response.items).toHaveLength(3);
  });

  it('should handle zero totalRecords gracefully', () => {
    const query: OffsetPaginationRequest = { page: 1, size: 10 };
    const items: number[] = [];
    const totalRecords = 0;

    const response = OffsetPaginationResponse.of({
      query,
      items,
      totalRecords,
    });

    expect(response.metadata.totalPages).toBe(0);
    expect(response.items).toEqual([]);
  });
});
