import { Equals, IsOptional, IsString } from 'class-validator';
import { CreateUserType } from '../constants/user-constant';

export type PublicFieldMapping = 'email' | 'fullName' | 'birthday';

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
