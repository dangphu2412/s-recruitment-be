import { IsArray, IsOptional } from 'class-validator';

export class UpdateUserRolesDto {
  @IsOptional()
  @IsArray()
  roleIds: number[];
}
