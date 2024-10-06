import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { CreateUserType } from '../constants/user-constant';

export class CreateUsersDto {
  @IsEnum(CreateUserType)
  createUserType: CreateUserType;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  fullName: string;

  @IsString()
  domainId: string;

  @IsString()
  periodId: string;

  @IsOptional()
  @IsString()
  birthday: string;

  @ValidateIf((dto) => dto.createUserType === CreateUserType.NEW_MEMBERS)
  @IsString()
  @IsNotEmpty()
  monthlyConfigId: string;
}
