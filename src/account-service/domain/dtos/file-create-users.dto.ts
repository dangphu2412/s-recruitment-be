import { Equals, IsOptional, IsString } from 'class-validator';
import { CreateUserType } from '../constants/user-constant';

export type PublicUserFields = 'email' | 'fullName' | 'birthday' | 'username';

export type FieldMappingsRequest = Record<string, PublicUserFields>;

export type FileRow = Record<string, string>;

export class FileCreateUsersDto {
  @Equals(CreateUserType.EXCEL)
  createUserType: CreateUserType;

  @IsOptional()
  @IsString()
  monthlyConfigId?: string;

  file: Express.Multer.File;

  @IsString()
  fieldMappings: string;
}
