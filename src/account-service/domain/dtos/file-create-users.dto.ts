import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export type FileRow = {
  'Họ và Tên:': string;
  Email: string;
  Username: string;
  'Join At': string;
};

export class FileCreateUsersDto {
  @IsNotEmpty()
  periodId: string;

  @IsOptional()
  @IsNumber()
  monthlyConfigId?: number;

  file: Express.Multer.File;
}
