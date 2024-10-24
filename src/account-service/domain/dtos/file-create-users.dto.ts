import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export type PublicUserFields =
  | 'email'
  | 'fullName'
  | 'birthday'
  | 'username'
  | 'joinedAt';

export type FieldMappingsRequest = Record<string, PublicUserFields>;

export type FileRow = {
  'Họ và Tên:': string;
  Email: string;
  Username: string;
  'Join At': string;
};

export class FileCreateUsersDto {
  @IsNotEmpty()
  periodId: number;

  @IsOptional()
  @IsNumber()
  monthlyConfigId?: number;

  file: Express.Multer.File;
}
