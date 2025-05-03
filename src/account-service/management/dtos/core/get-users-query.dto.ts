import { OffsetPaginationRequest } from 'src/system/pagination/offset-pagination-request';
import { DateRangeQuery } from 'src/system/dates/date-range.query';
import { UserStatus } from '../../user-status.constant';

export type GetUsersQueryDTO = OffsetPaginationRequest & {
  joinedIn?: DateRangeQuery;

  search: string;

  userStatus?: UserStatus[];

  departmentIds?: number[];

  periodIds?: number[];

  roleIds?: number[];
};
