import { IsArray } from 'class-validator';

export class UpdateRoleRequestDto {
  @IsArray()
  rights: number[];
}
