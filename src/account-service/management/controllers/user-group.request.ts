import { IsNotEmpty, IsOptional } from 'class-validator';
import { OffsetPagination } from '../../../system/query-shape/dto';

export class CreateUserGroupRequest {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  userIds: string[];
}

export class GetUserGroupRequest extends OffsetPagination {
  @IsOptional()
  search?: string;
}
