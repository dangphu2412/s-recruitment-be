import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateUsersDto {
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
}
