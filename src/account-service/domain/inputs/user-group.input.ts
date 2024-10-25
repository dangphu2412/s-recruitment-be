import { IsNotEmpty, IsOptional } from 'class-validator';
import { OffsetPagination } from '../../../system/query-shape/dto';

export interface CreateUserGroupInput {
  name: string;
  description: string;
  userIds: string[];
}

export class CreateUserGroupInputDto implements CreateUserGroupInput {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  userIds: string[];
}

export interface GetUserGroupInput extends OffsetPagination {
  search?: string;
}

export class GetUserGroupInputDto
  extends OffsetPagination
  implements GetUserGroupInput
{
  @IsOptional()
  search?: string;
}
