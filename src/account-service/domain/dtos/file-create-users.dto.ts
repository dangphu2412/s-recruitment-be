import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export type PublicUserFields = 'email' | 'fullName' | 'birthday' | 'username';

export type FieldMappingsRequest = Record<string, PublicUserFields>;

export type FileRow = Record<string, string>;

export class FileCreateUsersDto {
  @IsNotEmpty()
  periodId: number;

  @IsOptional()
  @IsNumber()
  monthlyConfigId?: number;

  file: Express.Multer.File;

  @IsString()
  fieldMappings: string;
}
