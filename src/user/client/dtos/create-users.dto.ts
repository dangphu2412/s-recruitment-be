import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { CreateUserType } from '../constants';

export class CreateUsersDto {
  @IsEnum(CreateUserType)
  createUserType: CreateUserType;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  fullName: string;

  @IsOptional()
  @IsString()
  birthday: string;

  @ValidateIf((dto) => dto.createUserType === CreateUserType.NEW_MEMBERS)
  @IsString()
  @IsNotEmpty()
  monthlyConfigId: string;
}
