import {
  ArrayNotEmpty,
  IsEnum,
  IsNotEmpty,
  IsString,
  ValidateIf,
} from 'class-validator';
import { CreateUserType } from '../constants';

export class CreateUsersDto {
  @IsEnum(CreateUserType)
  createUserType: CreateUserType;

  @IsString({
    each: true,
  })
  @ArrayNotEmpty()
  emails: string[];

  @ValidateIf((dto) => dto.createUserType === CreateUserType.NEW_MEMBERS)
  @IsString()
  @IsNotEmpty()
  monthlyConfigId: string;
}
