import { IsNumber, IsOptional } from 'class-validator';
import { InternalFile } from '../../../../system/file/file.interceptor';

export type FileRow = {
  'Họ và Tên': string;
  Email: string;
  'Join At': string;
  Tracking: string;
  'Ngày sinh': string;
  Khóa: string;
  SĐT: string;
};

export class FileCreateUsersDto {
  @IsOptional()
  @IsNumber()
  monthlyConfigId?: number;

  file: InternalFile;
}
