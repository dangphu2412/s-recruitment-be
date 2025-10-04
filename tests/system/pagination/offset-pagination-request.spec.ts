import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { OffsetPaginationRequest } from '../../../src/system/pagination/offset-pagination-request';

describe('OffsetPaginationRequest', () => {
  it('should transform page and size from strings to numbers', async () => {
    const input = { page: '3', size: '15' };
    const instance = plainToInstance(OffsetPaginationRequest, input);

    expect(instance.page).toBe(3);
    expect(instance.size).toBe(15);

    const errors = await validate(instance);
    expect(errors.length).toBe(0);
  });

  it('should fallback to default values when invalid', async () => {
    const input = { page: 'not-a-number', size: undefined };
    const instance = plainToInstance(OffsetPaginationRequest, input);

    expect(instance.page).toBe(1); // default
    expect(instance.size).toBe(25); // default

    const errors = await validate(instance);
    expect(errors.length).toBe(0); // still valid because defaults applied
  });

  it('should calculate correct offset', () => {
    expect(OffsetPaginationRequest.getOffset(1, 10)).toBe(0); // first page
    expect(OffsetPaginationRequest.getOffset(2, 10)).toBe(10); // second page
    expect(OffsetPaginationRequest.getOffset(3, 25)).toBe(50); // third page
  });

  it('should allow numeric inputs directly', async () => {
    const input = { page: 4, size: 50 };
    const instance = plainToInstance(OffsetPaginationRequest, input);

    expect(instance.page).toBe(4);
    expect(instance.size).toBe(50);

    const errors = await validate(instance);
    expect(errors.length).toBe(0);
  });
});
