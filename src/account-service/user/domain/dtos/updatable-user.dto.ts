import { IsArray, IsOptional } from 'class-validator';

export class UpdatableUserDto {
  @IsOptional()
  @IsArray()
  roleIds: number[];
}
