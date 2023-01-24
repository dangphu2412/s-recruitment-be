import { Equals, IsOptional, IsString } from 'class-validator';
import { CreateUserType } from '../constants';

export class FileCreateUsersDto {
  @Equals(CreateUserType.EXCEL)
  createUserType: CreateUserType;

  @IsOptional()
  @IsString()
  monthlyConfigId?: string;

  @IsString()
  processSheetName: string;

  file: Express.Multer.File;
}
