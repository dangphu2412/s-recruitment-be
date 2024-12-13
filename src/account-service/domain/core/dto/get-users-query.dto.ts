import { OffsetPagination } from 'src/system/query-shape/dto/offset-pagination.request';
import { DateRange } from 'src/system/query-shape/dto/date-range.query';
import { UserStatus } from '../../constants/user-constant';

export type GetUsersQueryDTO = OffsetPagination & {
  joinedIn?: DateRange;

  search: string;

  userStatus?: UserStatus[];

  departmentIds?: number[];

  periodIds?: number[];
};
