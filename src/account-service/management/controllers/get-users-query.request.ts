import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OffsetPagination } from 'src/system/query-shape/dto/offset-pagination.request';
import { UserStatus } from '../user-status.constant';
import { ToManyString } from '../../../system/query-shape/decorators/transformer';

export class GetUsersQueryRequest extends OffsetPagination {
  @IsOptional()
  @IsString()
  search: string;

  @IsOptional()
  @IsEnum(UserStatus, { each: true })
  @ToManyString()
  userStatus?: UserStatus[];

  @IsOptional()
  @ToManyString()
  departmentIds?: number[];

  @IsOptional()
  @ToManyString()
  periodIds?: number[];

  @IsOptional()
  @ToManyString()
  roleIds?: number[];
}
