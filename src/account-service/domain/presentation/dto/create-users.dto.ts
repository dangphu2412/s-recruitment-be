import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateUsersDto {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  fullName: string;

  @IsString()
  departmentId: string;

  @IsString()
  periodId: string;

  @IsOptional()
  @IsString()
  birthday: string;
}
