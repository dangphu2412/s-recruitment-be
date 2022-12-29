import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { OffsetPagination } from '@shared/query-shape/pagination/entities/offset-pagination.request';
import { DateRange } from '@shared/query-shape/filter/entities/date-range.query';
import { ToDateRange } from '@shared/query-shape/filter/decorators/to-date-range.decorator';
import { MemberType } from '../constants';

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
