import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { OffsetPagination } from 'src/system/query-shape/dto/offset-pagination.request';
import { DateRange } from 'src/system/query-shape/dto/date-range.query';
import { ToDateRange } from 'src/system/query-shape/decorators/to-date-range.decorator';
import { MemberType } from '../constants/user-constant';

export class UserManagementQueryDto extends OffsetPagination {
  @ToDateRange()
  @ValidateNested()
  joinedIn?: DateRange;

  // @ToSortQuery()
  // @IsOptional()
  // @IsSortQueryContains(['username', 'deadDate'])
  // sort?: SortQuery<'username' | 'deadDate'>;

  @IsOptional()
  @IsString()
  search: string;

  @IsOptional()
  @IsEnum(MemberType)
  memberType: MemberType = MemberType.ALL;
}
