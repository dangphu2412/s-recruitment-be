import { IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export class OffsetPaginationRequest {
  @Transform(({ value }) => parseInt(value) || 1)
  @IsNumber()
  page: number;

  @Transform(({ value }) => parseInt(value) || 25)
  @IsNumber()
  size: number;

  static getOffset(page: number, size: number): number {
    return (page - 1) * size;
  }
}
