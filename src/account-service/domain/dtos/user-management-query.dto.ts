import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { OffsetPagination } from 'src/system/query-shape/dto/offset-pagination.request';
import { DateRange } from 'src/system/query-shape/dto/date-range.query';
import { ToDateRange } from 'src/system/query-shape/decorators/to-date-range.decorator';
import { UserStatus } from '../constants/user-constant';
import { ToManyString } from '../../../system/query-shape/decorators/transformer';

export class UserManagementQueryDto extends OffsetPagination {
  @ToDateRange()
  @ValidateNested()
  joinedIn?: DateRange;

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
}
